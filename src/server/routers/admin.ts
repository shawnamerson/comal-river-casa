import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { stripe } from '@/lib/stripe'
import bcrypt from 'bcryptjs'

export const adminRouter = router({
  // Get a single booking by ID
  getBooking: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      if (!booking) {
        throw new Error('Booking not found')
      }

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
        user: booking.user,
      }
    }),

  // Get all bookings with user details
  getAllBookings: adminProcedure.query(async ({ ctx }) => {
    const bookings = await ctx.prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Convert Decimals and Dates to serializable format
    return bookings.map((booking) => ({
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
      user: booking.user,
    }))
  }),

  // Get booking statistics
  getStats: adminProcedure.query(async ({ ctx }) => {
    const now = new Date()

    // Total bookings
    const totalBookings = await ctx.prisma.booking.count()

    // Upcoming bookings (confirmed, not started yet)
    const upcomingBookings = await ctx.prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          gte: now,
        },
      },
    })

    // Current bookings (in progress)
    const currentBookings = await ctx.prisma.booking.count({
      where: {
        status: 'CONFIRMED',
        checkIn: {
          lte: now,
        },
        checkOut: {
          gte: now,
        },
      },
    })

    // Pending bookings (awaiting payment)
    const pendingBookings = await ctx.prisma.booking.count({
      where: {
        status: 'PENDING',
      },
    })

    // Total revenue (confirmed bookings only)
    const confirmedBookings = await ctx.prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
      },
      select: {
        totalPrice: true,
      },
    })

    const totalRevenue = confirmedBookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice),
      0
    )

    return {
      totalBookings,
      upcomingBookings,
      currentBookings,
      pendingBookings,
      totalRevenue,
    }
  }),

  // Get all blocked dates
  getBlockedDates: adminProcedure.query(async ({ ctx }) => {
    const blockedDates = await ctx.prisma.blockedDate.findMany({
      orderBy: {
        startDate: 'desc',
      },
    })

    return blockedDates.map((blocked) => ({
      id: blocked.id,
      startDate: blocked.startDate.toISOString(),
      endDate: blocked.endDate.toISOString(),
      reason: blocked.reason,
      createdAt: blocked.createdAt.toISOString(),
      updatedAt: blocked.updatedAt.toISOString(),
    }))
  }),

  // Create a blocked date range
  createBlockedDate: adminProcedure
    .input(
      z.object({
        startDate: z.string().transform((val) => new Date(val)),
        endDate: z.string().transform((val) => new Date(val)),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const blockedDate = await ctx.prisma.blockedDate.create({
        data: {
          startDate: input.startDate,
          endDate: input.endDate,
          reason: input.reason,
        },
      })

      return {
        id: blockedDate.id,
        startDate: blockedDate.startDate.toISOString(),
        endDate: blockedDate.endDate.toISOString(),
        reason: blockedDate.reason,
        createdAt: blockedDate.createdAt.toISOString(),
        updatedAt: blockedDate.updatedAt.toISOString(),
      }
    }),

  // Delete a blocked date
  deleteBlockedDate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.blockedDate.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  // Update booking status
  updateBookingStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
        cancellationReason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get the booking first to check for refund eligibility
      const existingBooking = await ctx.prisma.booking.findUnique({
        where: { id: input.id },
      })

      if (!existingBooking) {
        throw new Error('Booking not found')
      }

      const updateData: {
        status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
        cancelledAt?: Date
        cancellationReason?: string
        refundAmount?: number
      } = {
        status: input.status,
      }

      let refundAmount: number | null = null

      if (input.status === 'CANCELLED') {
        updateData.cancelledAt = new Date()
        if (input.cancellationReason) {
          updateData.cancellationReason = input.cancellationReason
        }

        // Check if eligible for refund (more than 24 hours before check-in)
        const now = new Date()
        const checkIn = new Date(existingBooking.checkIn)
        const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (
          hoursUntilCheckIn > 24 &&
          existingBooking.stripePaymentIntentId &&
          existingBooking.paymentStatus === 'SUCCEEDED'
        ) {
          try {
            // Issue full refund via Stripe
            const refund = await stripe.refunds.create({
              payment_intent: existingBooking.stripePaymentIntentId,
            })

            refundAmount = refund.amount / 100 // Convert from cents
            updateData.refundAmount = refundAmount
          } catch (error) {
            console.error('Failed to process refund:', error)
            throw new Error('Failed to process refund. Please try again or process manually.')
          }
        }
      }

      const booking = await ctx.prisma.booking.update({
        where: { id: input.id },
        data: updateData,
      })

      return {
        id: booking.id,
        status: booking.status,
        cancelledAt: booking.cancelledAt?.toISOString() || null,
        cancellationReason: booking.cancellationReason,
        refundAmount,
        refundEligible: refundAmount !== null,
      }
    }),

  // Get all seasonal rates
  getSeasonalRates: adminProcedure.query(async ({ ctx }) => {
    const rates = await ctx.prisma.seasonalRate.findMany({
      orderBy: {
        startDate: 'asc',
      },
    })

    return rates.map((rate) => ({
      id: rate.id,
      name: rate.name,
      startDate: rate.startDate.toISOString(),
      endDate: rate.endDate.toISOString(),
      pricePerNight: Number(rate.pricePerNight),
      cleaningFee: rate.cleaningFee ? Number(rate.cleaningFee) : null,
      minNights: rate.minNights,
      createdAt: rate.createdAt.toISOString(),
      updatedAt: rate.updatedAt.toISOString(),
    }))
  }),

  // Create a seasonal rate
  createSeasonalRate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        startDate: z.string().transform((val) => new Date(val)),
        endDate: z.string().transform((val) => new Date(val)),
        pricePerNight: z.number().positive(),
        cleaningFee: z.number().positive().optional(),
        minNights: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rate = await ctx.prisma.seasonalRate.create({
        data: {
          name: input.name,
          startDate: input.startDate,
          endDate: input.endDate,
          pricePerNight: input.pricePerNight,
          cleaningFee: input.cleaningFee,
          minNights: input.minNights,
        },
      })

      return {
        id: rate.id,
        name: rate.name,
        startDate: rate.startDate.toISOString(),
        endDate: rate.endDate.toISOString(),
        pricePerNight: Number(rate.pricePerNight),
        cleaningFee: rate.cleaningFee ? Number(rate.cleaningFee) : null,
        minNights: rate.minNights,
        createdAt: rate.createdAt.toISOString(),
        updatedAt: rate.updatedAt.toISOString(),
      }
    }),

  // Update a seasonal rate
  updateSeasonalRate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        startDate: z.string().transform((val) => new Date(val)).optional(),
        endDate: z.string().transform((val) => new Date(val)).optional(),
        pricePerNight: z.number().positive().optional(),
        cleaningFee: z.number().positive().optional(),
        minNights: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input
      const rate = await ctx.prisma.seasonalRate.update({
        where: { id },
        data: updateData as any,
      })

      return {
        id: rate.id,
        name: rate.name,
        startDate: rate.startDate.toISOString(),
        endDate: rate.endDate.toISOString(),
        pricePerNight: Number(rate.pricePerNight),
        cleaningFee: rate.cleaningFee ? Number(rate.cleaningFee) : null,
        minNights: rate.minNights,
        createdAt: rate.createdAt.toISOString(),
        updatedAt: rate.updatedAt.toISOString(),
      }
    }),

  // Delete a seasonal rate
  deleteSeasonalRate: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.seasonalRate.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),

  // Change admin password
  changePassword: adminProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session!.user.id
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user || !user.password) {
        throw new Error('User not found')
      }

      const valid = await bcrypt.compare(input.currentPassword, user.password)
      if (!valid) {
        throw new Error('Current password is incorrect')
      }

      const hash = await bcrypt.hash(input.newPassword, 10)
      await ctx.prisma.user.update({
        where: { id: userId },
        data: { password: hash },
      })

      return { success: true }
    }),
})
