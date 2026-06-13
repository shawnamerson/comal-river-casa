import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { resend } from '@/lib/resend'
import { CheckOutReminderEmail } from '@/emails/CheckOutReminder'
import { timingSafeEqual } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || !authHeader || !timingSafeEqual(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Find all confirmed bookings where checkOut is tomorrow (UTC)
    const now = new Date()
    const tomorrowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
    const tomorrowEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 2))

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkOut: {
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
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: booking.guestEmail,
          subject: 'Checkout Reminders — Comal River Casa',
          react: CheckOutReminderEmail({
            guestName: booking.guestName,
            checkOut: booking.checkOut.toISOString(),
            reviewToken: booking.reviewToken || booking.id,
          }),
        })

        if (error) {
          console.error(`Failed to send checkout reminder for booking ${booking.id}:`, error)
          failed++
          errors.push(`${booking.id}: ${error.message}`)
        } else {
          sent++
          console.log(`Sent checkout reminder for booking ${booking.id} to ${booking.guestEmail}`)
        }
      } catch (emailError) {
        console.error(`Failed to send checkout reminder for booking ${booking.id}:`, emailError)
        failed++
        errors.push(`${booking.id}: ${emailError instanceof Error ? emailError.message : String(emailError)}`)
      }
    }

    return NextResponse.json({
      message: 'Checkout reminder cron complete',
      totalBookings: bookings.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined,
      ranAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron check-out-reminder error:', error)
    return NextResponse.json(
      { error: 'Failed to send checkout reminders', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
