import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const reviewRouter = router({
  // ---- Public procedures ----

  getPublishedReviews: publicProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.prisma.review.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        rating: true,
        comment: true,
        guestName: true,
        source: true,
        hostResponse: true,
        createdAt: true,
      },
    })

    return reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }))
  }),

  submitReview: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        email: z.string().email(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { review: true },
      })

      if (!booking) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' })
      }

      if (booking.guestEmail.toLowerCase() !== input.email.toLowerCase()) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Email does not match booking' })
      }

      if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reviews can only be left for confirmed or completed bookings',
        })
      }

      if (new Date(booking.checkOut) > new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Reviews can only be left after checkout',
        })
      }

      if (booking.review) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'A review has already been submitted for this booking',
        })
      }

      const review = await ctx.prisma.review.create({
        data: {
          bookingId: booking.id,
          userId: booking.userId,
          rating: input.rating,
          comment: input.comment || null,
          guestName: booking.guestName,
          source: 'DIRECT',
          isPublished: false,
        },
      })

      return { id: review.id }
    }),

  // ---- Admin procedures ----

  getAllReviews: adminProcedure.query(async ({ ctx }) => {
    const reviews = await ctx.prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            guestEmail: true,
          },
        },
      },
    })

    return reviews.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      rating: r.rating,
      comment: r.comment,
      guestName: r.guestName,
      source: r.source,
      hostResponse: r.hostResponse,
      hostResponseDate: r.hostResponseDate?.toISOString() ?? null,
      isPublished: r.isPublished,
      createdAt: r.createdAt.toISOString(),
      booking: r.booking
        ? {
            id: r.booking.id,
            checkIn: r.booking.checkIn.toISOString(),
            checkOut: r.booking.checkOut.toISOString(),
            guestEmail: r.booking.guestEmail,
          }
        : null,
    }))
  }),

  publishReview: adminProcedure
    .input(z.object({ id: z.string(), isPublished: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.review.update({
        where: { id: input.id },
        data: { isPublished: input.isPublished },
      })
      return { success: true }
    }),

  respondToReview: adminProcedure
    .input(z.object({ id: z.string(), hostResponse: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.review.update({
        where: { id: input.id },
        data: {
          hostResponse: input.hostResponse,
          hostResponseDate: new Date(),
        },
      })
      return { success: true }
    }),

  createReview: adminProcedure
    .input(
      z.object({
        guestName: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
        source: z.enum(['AIRBNB', 'VRBO']),
        createdAt: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.prisma.review.create({
        data: {
          guestName: input.guestName,
          rating: input.rating,
          comment: input.comment || null,
          source: input.source,
          isPublished: false,
          createdAt: input.createdAt
            ? new Date(input.createdAt.length === 7 ? `${input.createdAt}-15` : input.createdAt)
            : undefined,
        },
      })
      return { id: review.id }
    }),

  deleteReview: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.review.delete({ where: { id: input.id } })
      return { success: true }
    }),
})
