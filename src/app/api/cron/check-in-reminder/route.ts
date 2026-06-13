import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { resend } from '@/lib/resend'
import { CheckInReminderEmail } from '@/emails/CheckInReminder'
import { timingSafeEqual } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function computeDoorCode(guestPhone: string | null): string {
  if (!guestPhone) {
    return 'Please contact us for your door code'
  }

  let digits = guestPhone.replace(/\D/g, '')

  // Remove leading 1 if it's 11 digits (US country code)
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1)
  }

  if (digits.length < 6) {
    return 'Please contact us for your door code'
  }

  return digits.slice(0, 6)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !authHeader || !timingSafeEqual(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all confirmed bookings where checkIn is tomorrow (UTC)
    const now = new Date()
    const tomorrowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
    const tomorrowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2))

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: tomorrowStart,
          lt: tomorrowEnd,
        },
      },
    })

    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const booking of bookings) {
      try {
        const doorCode = computeDoorCode(booking.guestPhone)

        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: booking.guestEmail,
          subject: "It's vacation time! — Comal River Casa",
          react: CheckInReminderEmail({
            guestName: booking.guestName,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            doorCode,
          }),
        })

        if (error) {
          console.error(`Failed to send check-in reminder for booking ${booking.id}:`, error)
          failed++
          errors.push(`${booking.id}: ${error.message}`)
        } else {
          sent++
          console.log(`Sent check-in reminder for booking ${booking.id} to ${booking.guestEmail}`)
        }
      } catch (emailError) {
        console.error(`Failed to send check-in reminder for booking ${booking.id}:`, emailError)
        failed++
        errors.push(`${booking.id}: ${emailError instanceof Error ? emailError.message : String(emailError)}`)
      }
    }

    return NextResponse.json({
      message: 'Check-in reminder cron complete',
      totalBookings: bookings.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      ranAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron check-in-reminder error:', error)
    return NextResponse.json(
      { error: 'Failed to send check-in reminders', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
