import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import { stripe } from '@/lib/stripe'

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
      const { checkIn, checkOut } = input
      const { eachDayOfInterval, differenceInDays } = await import('date-fns')

      const nights = differenceInDays(checkOut, checkIn)

      // Get all seasonal rates that might overlap with this booking
      const seasonalRates = await ctx.prisma.seasonalRate.findMany({
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

      // Calculate price for each night
      const allDates = eachDayOfInterval({ start: checkIn, end: checkOut })
      // Remove the last day (checkout day)
      const nights_dates = allDates.slice(0, -1)

      let totalNightlyPrice = 0
      let effectiveRate = null

      for (const date of nights_dates) {
        // Find if any seasonal rate applies to this date
        const applicableRate = seasonalRates.find((rate) => {
          return date >= rate.startDate && date < rate.endDate
        })

        if (applicableRate) {
          totalNightlyPrice += Number(applicableRate.pricePerNight)
          effectiveRate = applicableRate
        } else {
          // Use default base price from config
          const { PROPERTY } = await import('@/config/property')
          totalNightlyPrice += PROPERTY.basePrice
        }
      }

      // Determine cleaning fee and min nights
      const { PROPERTY } = await import('@/config/property')
      const cleaningFee = effectiveRate?.cleaningFee
        ? Number(effectiveRate.cleaningFee)
        : PROPERTY.cleaningFee
      const minNights = effectiveRate?.minNights || PROPERTY.minNights

      const subtotal = totalNightlyPrice
      const serviceFee = 0
      const totalPrice = subtotal + cleaningFee + serviceFee

      return {
        numberOfNights: nights,
        pricePerNight: totalNightlyPrice / nights, // Average price per night
        subtotal,
        cleaningFee,
        serviceFee,
        totalPrice,
        minNights,
        hasSeasonalRate: effectiveRate !== null,
      }
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
        numberOfGuests: z.number().min(1),
        guestName: z.string().min(1),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        numberOfNights: z.number().min(1),
        pricePerNight: z.number(),
        subtotal: z.number(),
        cleaningFee: z.number(),
        serviceFee: z.number().default(0),
        totalPrice: z.number(),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('Booking create mutation called with input:', {
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        numberOfGuests: input.numberOfGuests,
        guestEmail: input.guestEmail,
      })

      try {
        // Double-check availability before creating
        const availability = await ctx.prisma.booking.findMany({
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

        console.log('Availability check result:', availability.length, 'conflicts found')

        if (availability.length > 0) {
          throw new Error('These dates are no longer available')
        }
      } catch (error) {
        console.error('Error during availability check:', error)
        throw error
      }

      // Create the booking
      console.log('Creating booking in database...')
      const booking = await ctx.prisma.booking.create({
        data: {
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          numberOfGuests: input.numberOfGuests,
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          numberOfNights: input.numberOfNights,
          pricePerNight: input.pricePerNight,
          subtotal: input.subtotal,
          cleaningFee: input.cleaningFee,
          serviceFee: input.serviceFee,
          totalPrice: input.totalPrice,
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

      console.log('Booking created successfully, ID:', booking.id)

      // Convert Decimals to numbers and Dates to strings for serialization
      const result = {
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

      console.log('Returning serialized booking result')
      return result
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
        throw new Error('Booking not found. Please check your confirmation number and email address.')
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
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      }
    }),

  // Cancel a booking
  cancel: publicProcedure
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
        throw new Error('Booking not found')
      }

      if (booking.status === 'CANCELLED') {
        throw new Error('This booking is already cancelled')
      }

      // Check if eligible for refund:
      // - Always refund if booking is PENDING (not yet confirmed by owner)
      // - Refund if CONFIRMED and more than 24 hours before check-in
      const now = new Date()
      const checkIn = new Date(booking.checkIn)
      const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)

      const isEligibleForRefund =
        booking.status === 'PENDING' || hoursUntilCheckIn > 24

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
          throw new Error('Failed to process refund. Please contact support.')
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
        throw new Error('Booking not found')
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

      // Create new payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(booking.totalPrice) * 100), // Convert to cents
        currency: 'usd',
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

      // Update booking with payment intent ID
      await ctx.prisma.booking.update({
        where: { id: booking.id },
        data: {
          stripePaymentIntentId: paymentIntent.id,
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
        throw new Error('Booking not found')
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
