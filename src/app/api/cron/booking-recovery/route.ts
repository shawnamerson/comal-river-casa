import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { resend } from '@/lib/resend'
import { BookingRecoveryEmail } from '@/emails/BookingRecovery'
import { BookingRecoveryFinalEmail } from '@/emails/BookingRecoveryFinal'
import { timingSafeEqual } from '@/lib/utils'
import type { Booking } from '@prisma/client'

export const dynamic = 'force-dynamic'

const EXPIRED_REASON = 'Expired — payment not completed in time'

/** Check if a booking's dates are still available (no confirmed or active pending bookings overlap) */
async function areDatesAvailable(checkIn: Date, checkOut: Date, excludeBookingId: string): Promise<boolean> {
  const pendingCutoff = new Date(Date.now() - 10 * 60 * 1000)

  const overlapping = await prisma.booking.findFirst({
    where: {
      id: { not: excludeBookingId },
      OR: [
        { status: 'CONFIRMED' },
        { status: 'PENDING', createdAt: { gte: pendingCutoff } },
      ],
      AND: [
        {
          OR: [
            { AND: [{ checkIn: { lte: checkIn } }, { checkOut: { gt: checkIn } }] },
            { AND: [{ checkIn: { lt: checkOut } }, { checkOut: { gte: checkOut } }] },
            { AND: [{ checkIn: { gte: checkIn } }, { checkOut: { lte: checkOut } }] },
          ],
        },
      ],
    },
  })

  if (overlapping) return false

  const blocked = await prisma.blockedDate.findFirst({
    where: {
      OR: [
        { AND: [{ startDate: { lte: checkIn } }, { endDate: { gt: checkIn } }] },
        { AND: [{ startDate: { lt: checkOut } }, { endDate: { gte: checkOut } }] },
        { AND: [{ startDate: { gte: checkIn } }, { endDate: { lte: checkOut } }] },
      ],
    },
  })

  return !blocked
}

async function sendEmail(
  booking: Booking,
  type: 'first' | 'final',
): Promise<{ success: boolean; error?: string }> {
  const emailProps = {
    guestName: booking.guestName,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    numberOfNights: booking.numberOfNights,
    numberOfGuests: booking.numberOfGuests,
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: booking.guestEmail,
    cc: process.env.ADMIN_EMAIL,
    subject: type === 'first'
      ? 'Your dates are still available — Comal River Casa'
      : 'Last chance to book your river getaway — Comal River Casa',
    react: type === 'first'
      ? BookingRecoveryEmail(emailProps)
      : BookingRecoveryFinalEmail(emailProps),
  })

  if (error) return { success: false, error: error.message }

  await prisma.booking.update({
    where: { id: booking.id },
    data: type === 'first'
      ? { recoveryEmailSentAt: new Date() }
      : { recoveryEmail2SentAt: new Date() },
  })

  return { success: true }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !authHeader || !timingSafeEqual(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    let sent = 0
    let failed = 0
    const errors: string[] = []

    // --- First recovery email: 1-3 hours after expiry ---
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000)

    const firstEmailBookings = await prisma.booking.findMany({
      where: {
        status: 'CANCELLED',
        cancellationReason: EXPIRED_REASON,
        recoveryEmailSentAt: null,
        updatedAt: { gte: threeHoursAgo, lte: oneHourAgo },
        checkIn: { gt: now },
      },
    })

    for (const booking of firstEmailBookings) {
      try {
        const result = await sendEmail(booking, 'first')
        if (result.success) {
          sent++
          console.log(`Sent recovery email #1 for booking ${booking.id} to ${booking.guestEmail}`)
        } else {
          failed++
          errors.push(`${booking.id}: ${result.error}`)
          console.error(`Failed to send recovery email #1 for booking ${booking.id}:`, result.error)
        }
      } catch (emailError) {
        failed++
        errors.push(`${booking.id}: ${emailError instanceof Error ? emailError.message : String(emailError)}`)
      }
    }

    // --- Final recovery email: 3-7 days after expiry, only if dates still available ---
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)

    const finalEmailBookings = await prisma.booking.findMany({
      where: {
        status: 'CANCELLED',
        cancellationReason: EXPIRED_REASON,
        recoveryEmailSentAt: { not: null },
        recoveryEmail2SentAt: null,
        updatedAt: { gte: sevenDaysAgo, lte: threeDaysAgo },
        checkIn: { gt: now },
      },
    })

    for (const booking of finalEmailBookings) {
      try {
        const available = await areDatesAvailable(booking.checkIn, booking.checkOut, booking.id)
        if (!available) {
          console.log(`Skipping recovery email #2 for booking ${booking.id} — dates no longer available`)
          continue
        }

        const result = await sendEmail(booking, 'final')
        if (result.success) {
          sent++
          console.log(`Sent recovery email #2 for booking ${booking.id} to ${booking.guestEmail}`)
        } else {
          failed++
          errors.push(`${booking.id}: ${result.error}`)
          console.error(`Failed to send recovery email #2 for booking ${booking.id}:`, result.error)
        }
      } catch (emailError) {
        failed++
        errors.push(`${booking.id}: ${emailError instanceof Error ? emailError.message : String(emailError)}`)
      }
    }

    return NextResponse.json({
      message: 'Booking recovery cron complete',
      firstEmailCandidates: firstEmailBookings.length,
      finalEmailCandidates: finalEmailBookings.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      ranAt: now.toISOString(),
    })
  } catch (error) {
    console.error('Cron booking-recovery error:', error)
    return NextResponse.json(
      { error: 'Failed to send recovery emails', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
