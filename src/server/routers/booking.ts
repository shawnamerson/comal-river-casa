import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { stripe } from '@/lib/stripe'
import { resend } from '@/lib/resend'
import { BookingCancellationEmail } from '@/emails/BookingCancellation'
import { CancellationNotificationEmail } from '@/emails/CancellationNotification'
import { TRPCError } from '@trpc/server'
import { PROPERTY } from '@/config/property'
import type { PrismaClient } from '@prisma/client'

// Maximum booking window — matches the 12-month admin rates/availability calendar
const BOOKING_WINDOW_MONTHS = 12

async function assertWithinBookingWindow(checkOut: Date) {
  const { addMonths } = await import('date-fns')
  const maxDate = addMonths(new Date(), BOOKING_WINDOW_MONTHS)
  if (checkOut > maxDate) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Bookings cannot be made more than 12 months in advance',
    })
  }
}

// Shared server-side price calculation — used by calculatePrice query AND booking.create
// so the client can never supply its own pricing.
async function computeBookingPrice(
  prisma: PrismaClient,
  checkIn: Date,
  checkOut: Date
) {
  const { eachDayOfInterval, differenceInDays } = await import('date-fns')
  const { PROPERTY } = await import('@/config/property')

  const nights = differenceInDays(checkOut, checkIn)

  const dbSettings = await prisma.propertySettings.findUnique({ where: { id: 'default' } })
  const defaultBasePrice = dbSettings ? Number(dbSettings.basePrice) : PROPERTY.basePrice
  const defaultCleaningFee = dbSettings ? Number(dbSettings.cleaningFee) : PROPERTY.cleaningFee
  const defaultMinNights = dbSettings ? dbSettings.minNights : PROPERTY.minNights
  const maxNights = dbSettings?.maxNights ?? PROPERTY.maxNights

  if (nights > maxNights) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Maximum stay is ${maxNights} nights`,
    })
  }

  const nightDates = eachDayOfInterval({ start: checkIn, end: checkOut }).slice(0, -1)

  const overrides = await prisma.dateRateOverride.findMany({
    where: {
      date: { gte: checkIn, lt: checkOut },
    },
  })

  const overrideMap = new Map<string, typeof overrides[number]>()
  for (const o of overrides) {
    overrideMap.set(o.date.toISOString().slice(0, 10), o)
  }

  let totalNightlyPrice = 0
  let hasCustomRate = false
  let maxMinNights = defaultMinNights

  for (const date of nightDates) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const override = overrideMap.get(key)
    if (override?.pricePerNight != null) {
      totalNightlyPrice += Number(override.pricePerNight)
      hasCustomRate = true
    } else {
      totalNightlyPrice += defaultBasePrice
    }
    if (override?.minNights != null && override.minNights > maxMinNights) {
      maxMinNights = override.minNights
    }
  }

  const cleaningFee = defaultCleaningFee
  const minNights = maxMinNights
  const subtotal = totalNightlyPrice
  const serviceFee = 0
  const totalPrice = subtotal + cleaningFee + serviceFee

  return {
    numberOfNights: nights,
    pricePerNight: totalNightlyPrice / nights,
    subtotal,
    cleaningFee,
    serviceFee,
    totalPrice,
    minNights,
    hasCustomRate,
  }
}

export const bookingRouter = router({
  // Calculate pricing for a date range including seasonal rates
  calculatePrice: publicProcedure
    .input(
      z.object({
        checkIn: z.string().transform((val) => new Date(val)),
        checkOut: z.string().transform((val) => new Date(val)),
        numberOfGuests: z.number().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      assertWithinBookingWindow(input.checkOut)
      return computeBookingPrice(ctx.prisma, input.checkIn, input.checkOut)
    }),

  // Check if dates are available
  checkAvailability: publicProcedure
    .input(
      z.object({
        checkIn: z.string().transform((val) => new Date(val)),
        checkOut: z.string().transform((val) => new Date(val)),
      })
    )
    .query(async ({ ctx, input }) => {
      const { checkIn, checkOut } = input
      assertWithinBookingWindow(checkOut)

      // Check for overlapping bookings
      const existingBookings = await ctx.prisma.booking.findMany({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
          OR: [
            // New booking starts during existing booking
            {
              AND: [
                { checkIn: { lte: checkIn } },
                { checkOut: { gt: checkIn } },
              ],
            },
            // New booking ends during existing booking
            {
              AND: [
                { checkIn: { lt: checkOut } },
                { checkOut: { gte: checkOut } },
              ],
            },
            // New booking encompasses existing booking
            {
              AND: [
                { checkIn: { gte: checkIn } },
                { checkOut: { lte: checkOut } },
              ],
            },
          ],
        },
      })

      // Check for blocked dates
      const blockedDates = await ctx.prisma.blockedDate.findMany({
        where: {
          OR: [
            {
              AND: [
                { startDate: { lte: checkIn } },
                { endDate: { gt: checkIn } },
              ],
            },
            {
              AND: [
                { startDate: { lt: checkOut } },
                { endDate: { gte: checkOut } },
              ],
            },
            {
              AND: [
                { startDate: { gte: checkIn } },
                { endDate: { lte: checkOut } },
              ],
            },
          ],
        },
      })

      const isAvailable = existingBookings.length === 0 && blockedDates.length === 0

      return {
        available: isAvailable,
        conflictingBookings: existingBookings.length,
        blockedDates: blockedDates.length,
      }
    }),

  // Get booked dates for calendar display
  getBookedDates: publicProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.prisma.booking.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        checkOut: {
          gte: new Date(), // Only future/current bookings
        },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    })

    const blockedDates = await ctx.prisma.blockedDate.findMany({
      where: {
        endDate: {
          gte: new Date(),
        },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    })

    return {
      bookings,
      blockedDates,
    }
  }),

  // Create a new booking
  create: publicProcedure
    .input(
      z.object({
        checkIn: z.string().transform((val) => new Date(val)),
        checkOut: z.string().transform((val) => new Date(val)),
        numberOfGuests: z.number().min(1).max(PROPERTY.maxGuests),
        guestName: z.string().min(1),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      assertWithinBookingWindow(input.checkOut)

      // Compute pricing server-side — never trust client-supplied values
      const pricing = await computeBookingPrice(ctx.prisma, input.checkIn, input.checkOut)

      // Atomic availability check + booking creation to prevent race conditions
      const booking = await ctx.prisma.$transaction(async (tx) => {
        // Check for overlapping bookings inside the transaction
        const conflicts = await tx.booking.findMany({
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
            OR: [
              {
                AND: [
                  { checkIn: { lte: input.checkIn } },
                  { checkOut: { gt: input.checkIn } },
                ],
              },
              {
                AND: [
                  { checkIn: { lt: input.checkOut } },
                  { checkOut: { gte: input.checkOut } },
                ],
              },
              {
                AND: [
                  { checkIn: { gte: input.checkIn } },
                  { checkOut: { lte: input.checkOut } },
                ],
              },
            ],
          },
        })

        if (conflicts.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'These dates are no longer available',
          })
        }

        // Check for blocked dates inside the transaction
        const blockedConflicts = await tx.blockedDate.findMany({
          where: {
            OR: [
              {
                AND: [
                  { startDate: { lte: input.checkIn } },
                  { endDate: { gt: input.checkIn } },
                ],
              },
              {
                AND: [
                  { startDate: { lt: input.checkOut } },
                  { endDate: { gte: input.checkOut } },
                ],
              },
              {
                AND: [
                  { startDate: { gte: input.checkIn } },
                  { endDate: { lte: input.checkOut } },
                ],
              },
            ],
          },
        })

        if (blockedConflicts.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'These dates are no longer available',
          })
        }

        return tx.booking.create({
          data: {
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            numberOfGuests: input.numberOfGuests,
            guestName: input.guestName,
            guestEmail: input.guestEmail,
            guestPhone: input.guestPhone,
            numberOfNights: pricing.numberOfNights,
            pricePerNight: pricing.pricePerNight,
            subtotal: pricing.subtotal,
            cleaningFee: pricing.cleaningFee,
            serviceFee: pricing.serviceFee,
            totalPrice: pricing.totalPrice,
            specialRequests: input.specialRequests,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            user: {
              connectOrCreate: {
                where: { email: input.guestEmail },
                create: {
                  email: input.guestEmail,
                  name: input.guestName,
                  role: 'GUEST',
                },
              },
            },
          },
        })
      }, { isolationLevel: 'Serializable' })

      // Convert Decimals to numbers and Dates to strings for serialization
      return {
        id: booking.id,
        userId: booking.userId,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        numberOfGuests: booking.numberOfGuests,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        numberOfNights: booking.numberOfNights,
        pricePerNight: Number(booking.pricePerNight),
        subtotal: Number(booking.subtotal),
        cleaningFee: Number(booking.cleaningFee),
        serviceFee: Number(booking.serviceFee),
        totalPrice: Number(booking.totalPrice),
        specialRequests: booking.specialRequests,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        stripePaymentIntentId: booking.stripePaymentIntentId,
        stripeSessionId: booking.stripeSessionId,
        cancelledAt: booking.cancelledAt?.toISOString() || null,
        cancellationReason: booking.cancellationReason,
        refundAmount: booking.refundAmount ? Number(booking.refundAmount) : null,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      }
    }),

  // Look up a booking by ID and email
  lookup: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findFirst({
        where: {
          id: input.bookingId,
          guestEmail: input.email,
        },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found. Please check your confirmation number and email address.',
        })
      }

      // Convert Decimals to numbers and Dates to strings for serialization
      return {
        id: booking.id,
        userId: booking.userId,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
        numberOfGuests: booking.numberOfGuests,
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        guestPhone: booking.guestPhone,
        numberOfNights: booking.numberOfNights,
        pricePerNight: Number(booking.pricePerNight),
        subtotal: Number(booking.subtotal),
        cleaningFee: Number(booking.cleaningFee),
        serviceFee: Number(booking.serviceFee),
        totalPrice: Number(booking.totalPrice),
        specialRequests: booking.specialRequests,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        cancelledAt: booking.cancelledAt?.toISOString() || null,
        cancellationReason: booking.cancellationReason,
        refundAmount: booking.refundAmount ? Number(booking.refundAmount) : null,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      }
    }),

  // Cancel a booking
  cancel: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        guestEmail: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership — require both booking ID and the guest's email to match
      const booking = await ctx.prisma.booking.findFirst({
        where: { id: input.bookingId, guestEmail: input.guestEmail },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (booking.status === 'CANCELLED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This booking is already cancelled',
        })
      }

      // Bookings are automatically confirmed on payment.
      // Full refund if cancelled more than 24 hours before check-in.
      const now = new Date()
      const checkIn = new Date(booking.checkIn)
      const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)

      const isEligibleForRefund = hoursUntilCheckIn > 24

      let refundAmount: number | null = null

      if (
        isEligibleForRefund &&
        booking.stripePaymentIntentId &&
        booking.paymentStatus === 'SUCCEEDED'
      ) {
        try {
          // Issue full refund via Stripe
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
          })

          refundAmount = refund.amount / 100 // Convert from cents
        } catch (error) {
          console.error('Failed to process refund:', error)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to process refund. Please contact support.',
          })
        }
      }

      // Update booking status to cancelled
      const updated = await ctx.prisma.booking.update({
        where: { id: input.bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: 'Cancelled by guest',
          refundAmount: refundAmount,
        },
      })

      // Send cancellation email to guest
      try {
        const { error: cancelError } = await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: updated.guestEmail,
          subject: 'Booking Cancelled — Comal River Casa',
          react: BookingCancellationEmail({
            guestName: updated.guestName,
            bookingId: updated.id,
            checkIn: updated.checkIn.toISOString(),
            checkOut: updated.checkOut.toISOString(),
            totalPrice: Number(updated.totalPrice),
            refundAmount,
            cancellationReason: updated.cancellationReason,
          }),
        })
        if (cancelError) {
          console.error('Failed to send cancellation email:', cancelError)
        }
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError)
      }

      // Send cancellation notification to admin
      try {
        const { error: adminError } = await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: process.env.ADMIN_EMAIL!,
          subject: `Booking Cancelled — ${updated.guestName}`,
          react: CancellationNotificationEmail({
            guestName: updated.guestName,
            guestEmail: updated.guestEmail,
            guestPhone: updated.guestPhone,
            bookingId: updated.id,
            checkIn: updated.checkIn.toISOString(),
            checkOut: updated.checkOut.toISOString(),
            totalPrice: Number(updated.totalPrice),
            refundAmount,
            cancellationReason: updated.cancellationReason,
            cancelledBy: 'guest',
          }),
        })
        if (adminError) {
          console.error('Failed to send admin cancellation notification:', adminError)
        }
      } catch (emailError) {
        console.error('Failed to send admin cancellation notification:', emailError)
      }

      return {
        id: updated.id,
        status: updated.status,
        cancelledAt: updated.cancelledAt?.toISOString() || null,
        refundAmount,
        refundEligible: isEligibleForRefund,
      }
    }),

  // Create a payment intent for a booking
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      if (booking.stripePaymentIntentId) {
        // Return existing payment intent client secret
        const existingIntent = await stripe.paymentIntents.retrieve(
          booking.stripePaymentIntentId
        )
        return {
          clientSecret: existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        }
      }

      // Create or reuse a Stripe Customer so the card is saved for potential post-checkout charges
      let stripeCustomerId = booking.stripeCustomerId
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: booking.guestEmail,
          name: booking.guestName,
          metadata: { bookingId: booking.id },
        })
        stripeCustomerId = customer.id
      }

      // Create new payment intent with card saving enabled
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(booking.totalPrice) * 100), // Convert to cents
        currency: 'usd',
        customer: stripeCustomerId,
        setup_future_usage: 'off_session',
        metadata: {
          bookingId: booking.id,
          guestEmail: booking.guestEmail,
          guestName: booking.guestName,
          checkIn: booking.checkIn.toISOString(),
          checkOut: booking.checkOut.toISOString(),
        },
        receipt_email: booking.guestEmail,
        description: `Booking for ${booking.guestName} - ${booking.checkIn.toLocaleDateString()} to ${booking.checkOut.toLocaleDateString()}`,
      })

      // Update booking with payment intent ID and customer ID
      await ctx.prisma.booking.update({
        where: { id: booking.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId,
        },
      })

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }
    }),

  // Confirm payment was successful (called after Stripe confirms)
  confirmPayment: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        paymentIntentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
      })

      if (!booking) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Booking not found',
        })
      }

      // Verify the PaymentIntent belongs to this booking — prevents replay attacks
      // where a succeeded PaymentIntent from a different booking is reused
      if (booking.stripePaymentIntentId !== input.paymentIntentId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Payment intent does not match this booking',
        })
      }

      // Verify payment intent status with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId)

      if (paymentIntent.status === 'succeeded') {
        // Update booking status
        const updated = await ctx.prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'CONFIRMED',
            paymentStatus: 'SUCCEEDED',
          },
        })

        return {
          success: true,
          status: updated.status,
          paymentStatus: updated.paymentStatus,
        }
      } else {
        return {
          success: false,
          status: booking.status,
          paymentStatus: paymentIntent.status,
        }
      }
    }),
})
