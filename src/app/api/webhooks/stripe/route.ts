import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/db/prisma'
import { resend } from '@/lib/resend'
import { BookingConfirmationEmail } from '@/emails/BookingConfirmation'
import { NewBookingNotificationEmail } from '@/emails/NewBookingNotification'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  console.log(`Webhook received: ${event.type}`)

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Handle damage charge payments
        if (paymentIntent.metadata.type === 'damage_charge') {
          await prisma.damageCharge.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: { status: 'SUCCEEDED' },
          })
          console.log(`Damage charge ${paymentIntent.id} succeeded via webhook`)
          break
        }

        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: 'CONFIRMED',
              paymentStatus: 'SUCCEEDED',
            },
          })
          console.log(`Booking ${bookingId} confirmed via webhook`)

          // Send confirmation email
          try {
            const { error: confirmError } = await resend.emails.send({
              from: process.env.EMAIL_FROM!,
              to: booking.guestEmail,
              subject: `Booking Confirmed — Comal River Casa`,
              react: BookingConfirmationEmail({
                guestName: booking.guestName,
                guestEmail: booking.guestEmail,
                bookingId: booking.id,
                checkIn: booking.checkIn.toISOString(),
                checkOut: booking.checkOut.toISOString(),
                numberOfNights: booking.numberOfNights,
                numberOfGuests: booking.numberOfGuests,
                pricePerNight: Number(booking.pricePerNight),
                cleaningFee: Number(booking.cleaningFee),
                taxBreakdown: booking.taxBreakdown as { name: string; rate: number; amount: number }[] | null,
                totalPrice: Number(booking.totalPrice),
                specialRequests: booking.specialRequests,
              }),
            })
            if (confirmError) {
              console.error('Failed to send confirmation email:', confirmError)
            } else {
              console.log(`Confirmation email sent to ${booking.guestEmail}`)
            }
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
          }

          // Send admin notification
          try {
            const { error: adminError } = await resend.emails.send({
              from: process.env.EMAIL_FROM!,
              to: process.env.ADMIN_EMAIL!,
              subject: `New Booking — ${booking.guestName} — ${booking.checkIn.toLocaleDateString()}`,
              react: NewBookingNotificationEmail({
                guestName: booking.guestName,
                guestEmail: booking.guestEmail,
                guestPhone: booking.guestPhone,
                bookingId: booking.id,
                checkIn: booking.checkIn.toISOString(),
                checkOut: booking.checkOut.toISOString(),
                numberOfNights: booking.numberOfNights,
                numberOfGuests: booking.numberOfGuests,
                totalPrice: Number(booking.totalPrice),
                taxTotal: booking.taxTotal ? Number(booking.taxTotal) : null,
                specialRequests: booking.specialRequests,
              }),
            })
            if (adminError) {
              console.error('Failed to send admin notification:', adminError)
            } else {
              console.log(`Admin notification sent to ${process.env.ADMIN_EMAIL}`)
            }
          } catch (emailError) {
            console.error('Failed to send admin notification:', emailError)
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Handle damage charge payment failures
        if (paymentIntent.metadata.type === 'damage_charge') {
          await prisma.damageCharge.updateMany({
            where: { stripePaymentIntentId: paymentIntent.id },
            data: { status: 'FAILED' },
          })
          console.log(`Damage charge ${paymentIntent.id} failed via webhook`)
          break
        }

        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await prisma.booking.update({
            where: { id: bookingId },
            data: {
              paymentStatus: 'FAILED',
            },
          })
          console.log(`Booking ${bookingId} payment failed`)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent as string

        if (paymentIntentId) {
          const booking = await prisma.booking.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
          })

          if (booking && booking.status !== 'CANCELLED') {
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                status: 'CANCELLED',
                paymentStatus: 'REFUNDED',
                refundAmount: charge.amount_refunded / 100,
                cancelledAt: new Date(),
                cancellationReason: 'Payment refunded',
              },
            })
            console.log(`Booking ${booking.id} refunded via webhook`)
          } else if (booking) {
            // Booking was already cancelled by admin/guest — just update payment status and refund amount
            await prisma.booking.update({
              where: { id: booking.id },
              data: {
                paymentStatus: 'REFUNDED',
                refundAmount: charge.amount_refunded / 100,
              },
            })
            console.log(`Booking ${booking.id} refund amount updated via webhook (already cancelled)`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
