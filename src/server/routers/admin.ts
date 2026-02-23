import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { stripe } from '@/lib/stripe'
import bcrypt from 'bcryptjs'
import { resend } from '@/lib/resend'
import { BookingCancellationEmail } from '@/emails/BookingCancellation'
import { CancellationNotificationEmail } from '@/emails/CancellationNotification'
import { DamageChargeEmail } from '@/emails/DamageCharge'
import { TRPCError } from '@trpc/server'

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
          damageCharges: { orderBy: { createdAt: 'desc' } },
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
        stripeCustomerId: booking.stripeCustomerId,
        cancelledAt: booking.cancelledAt?.toISOString() || null,
        cancellationReason: booking.cancellationReason,
        refundAmount: booking.refundAmount ? Number(booking.refundAmount) : null,
        damageCharges: booking.damageCharges.map((dc) => ({
          id: dc.id,
          amount: Number(dc.amount),
          description: dc.description,
          status: dc.status,
          createdAt: dc.createdAt.toISOString(),
        })),
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

      // Send cancellation emails
      if (input.status === 'CANCELLED') {
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: booking.guestEmail,
            subject: 'Booking Cancelled — Comal River Casa',
            react: BookingCancellationEmail({
              guestName: booking.guestName,
              bookingId: booking.id,
              checkIn: booking.checkIn.toISOString(),
              checkOut: booking.checkOut.toISOString(),
              totalPrice: Number(booking.totalPrice),
              refundAmount,
              cancellationReason: input.cancellationReason,
            }),
          })
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError)
        }

        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: process.env.ADMIN_EMAIL!,
            subject: `Booking Cancelled — ${booking.guestName}`,
            react: CancellationNotificationEmail({
              guestName: booking.guestName,
              guestEmail: booking.guestEmail,
              guestPhone: booking.guestPhone,
              bookingId: booking.id,
              checkIn: booking.checkIn.toISOString(),
              checkOut: booking.checkOut.toISOString(),
              totalPrice: Number(booking.totalPrice),
              refundAmount,
              cancellationReason: input.cancellationReason,
              cancelledBy: 'admin',
            }),
          })
        } catch (emailError) {
          console.error('Failed to send admin cancellation notification:', emailError)
        }
      }

      return {
        id: booking.id,
        status: booking.status,
        cancelledAt: booking.cancelledAt?.toISOString() || null,
        cancellationReason: booking.cancellationReason,
        refundAmount,
        refundEligible: refundAmount !== null,
      }
    }),

  // Charge damage fee against guest's saved card
  chargeDamage: adminProcedure
    .input(
      z.object({
        bookingId: z.string(),
        amount: z.number().positive().max(10000),
        description: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
      })

      if (!booking) throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })

      if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking must be confirmed or completed to charge for damages' })
      }

      if (booking.paymentStatus !== 'SUCCEEDED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Booking payment must have succeeded' })
      }

      if (!booking.stripeCustomerId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No saved payment method for this booking' })
      }

      // Get saved payment methods for this customer
      const paymentMethods = await stripe.paymentMethods.list({
        customer: booking.stripeCustomerId,
        type: 'card',
      })

      if (paymentMethods.data.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No saved card found for this guest' })
      }

      const amountCents = Math.round(input.amount * 100)

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountCents,
          currency: 'usd',
          customer: booking.stripeCustomerId,
          payment_method: paymentMethods.data[0].id,
          off_session: true,
          confirm: true,
          metadata: {
            type: 'damage_charge',
            bookingId: booking.id,
          },
          description: `Damage charge — Comal River Casa — ${booking.guestName}: ${input.description}`,
          receipt_email: booking.guestEmail,
        })

        const damageCharge = await ctx.prisma.damageCharge.create({
          data: {
            bookingId: booking.id,
            amount: input.amount,
            description: input.description,
            stripePaymentIntentId: paymentIntent.id,
            status: paymentIntent.status === 'succeeded' ? 'SUCCEEDED' : 'PENDING',
          },
        })

        // Send notification email to guest
        try {
          await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: booking.guestEmail,
            subject: 'Damage Charge — Comal River Casa',
            react: DamageChargeEmail({
              guestName: booking.guestName,
              bookingId: booking.id,
              checkIn: booking.checkIn.toISOString(),
              checkOut: booking.checkOut.toISOString(),
              chargeAmount: input.amount,
              description: input.description,
            }),
          })
        } catch (e) {
          console.error('Failed to send damage charge email', e)
        }

        return {
          id: damageCharge.id,
          amount: Number(damageCharge.amount),
          description: damageCharge.description,
          status: damageCharge.status,
          createdAt: damageCharge.createdAt.toISOString(),
        }
      } catch (err: any) {
        // Handle SCA / authentication_required errors
        if (err.code === 'authentication_required') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'The card requires authentication and cannot be charged off-session. Contact the guest directly.',
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: err.message ?? 'Failed to process damage charge',
        })
      }
    }),

  // Get all date rate overrides
  getDateRateOverrides: adminProcedure.query(async ({ ctx }) => {
    const overrides = await ctx.prisma.dateRateOverride.findMany({
      orderBy: { date: 'asc' },
    })
    return overrides.map((o) => ({
      date: o.date.toISOString().slice(0, 10),
      pricePerNight: o.pricePerNight != null ? Number(o.pricePerNight) : null,
      minNights: o.minNights,
    }))
  }),

  // Set price per night for specific dates
  setDateRatePrice: adminProcedure
    .input(z.object({ dates: z.array(z.string()), pricePerNight: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.dates.map((d) =>
          ctx.prisma.dateRateOverride.upsert({
            where: { date: new Date(d + 'T00:00:00Z') },
            update: { pricePerNight: input.pricePerNight },
            create: { date: new Date(d + 'T00:00:00Z'), pricePerNight: input.pricePerNight },
          })
        )
      )
      return { success: true }
    }),

  // Clear price per night for specific dates
  clearDateRatePrice: adminProcedure
    .input(z.object({ dates: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      for (const d of input.dates) {
        const dateVal = new Date(d + 'T00:00:00Z')
        await ctx.prisma.dateRateOverride.updateMany({
          where: { date: dateVal },
          data: { pricePerNight: null },
        })
        // Delete rows where both fields are null
        await ctx.prisma.dateRateOverride.deleteMany({
          where: { date: dateVal, pricePerNight: null, minNights: null },
        })
      }
      return { success: true }
    }),

  // Set minimum nights for specific dates
  setDateRateMinNights: adminProcedure
    .input(z.object({ dates: z.array(z.string()), minNights: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.dates.map((d) =>
          ctx.prisma.dateRateOverride.upsert({
            where: { date: new Date(d + 'T00:00:00Z') },
            update: { minNights: input.minNights },
            create: { date: new Date(d + 'T00:00:00Z'), minNights: input.minNights },
          })
        )
      )
      return { success: true }
    }),

  // Clear minimum nights for specific dates
  clearDateRateMinNights: adminProcedure
    .input(z.object({ dates: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      for (const d of input.dates) {
        const dateVal = new Date(d + 'T00:00:00Z')
        await ctx.prisma.dateRateOverride.updateMany({
          where: { date: dateVal },
          data: { minNights: null },
        })
        await ctx.prisma.dateRateOverride.deleteMany({
          where: { date: dateVal, pricePerNight: null, minNights: null },
        })
      }
      return { success: true }
    }),

  // Get property settings (singleton)
  getPropertySettings: adminProcedure.query(async ({ ctx }) => {
    const settings = await ctx.prisma.propertySettings.findUnique({
      where: { id: 'default' },
    })

    if (!settings) {
      // Seed from config if missing
      const { PROPERTY } = await import('@/config/property')
      const created = await ctx.prisma.propertySettings.create({
        data: {
          id: 'default',
          basePrice: PROPERTY.basePrice,
          cleaningFee: PROPERTY.cleaningFee,
          minNights: PROPERTY.minNights,
          maxNights: PROPERTY.maxNights,
        },
      })
      return {
        basePrice: Number(created.basePrice),
        cleaningFee: Number(created.cleaningFee),
        minNights: created.minNights,
        maxNights: created.maxNights,
        updatedAt: created.updatedAt.toISOString(),
      }
    }

    return {
      basePrice: Number(settings.basePrice),
      cleaningFee: Number(settings.cleaningFee),
      minNights: settings.minNights,
      maxNights: settings.maxNights,
      updatedAt: settings.updatedAt.toISOString(),
    }
  }),

  // Update property settings
  updatePropertySettings: adminProcedure
    .input(
      z.object({
        basePrice: z.number().positive(),
        cleaningFee: z.number().min(0),
        minNights: z.number().int().positive(),
        maxNights: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.prisma.propertySettings.upsert({
        where: { id: 'default' },
        update: {
          basePrice: input.basePrice,
          cleaningFee: input.cleaningFee,
          minNights: input.minNights,
          maxNights: input.maxNights,
        },
        create: {
          id: 'default',
          basePrice: input.basePrice,
          cleaningFee: input.cleaningFee,
          minNights: input.minNights,
          maxNights: input.maxNights,
        },
      })

      return {
        basePrice: Number(settings.basePrice),
        cleaningFee: Number(settings.cleaningFee),
        minNights: settings.minNights,
        maxNights: settings.maxNights,
        updatedAt: settings.updatedAt.toISOString(),
      }
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
