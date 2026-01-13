import { z } from 'zod'
import { router, publicProcedure } from '../trpc'
import * as ical from 'node-ical'

export const externalCalendarRouter = router({
  // List all external calendars
  list: publicProcedure.query(async ({ ctx }) => {
    const calendars = await ctx.prisma.externalCalendar.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return calendars
  }),

  // Add a new external calendar
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        platform: z.enum(['AIRBNB', 'VRBO', 'BOOKING_COM', 'OTHER']),
        icalUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const calendar = await ctx.prisma.externalCalendar.create({
        data: {
          name: input.name,
          platform: input.platform,
          icalUrl: input.icalUrl,
          isActive: true,
        },
      })
      return calendar
    }),

  // Update an external calendar
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        icalUrl: z.string().url().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const calendar = await ctx.prisma.externalCalendar.update({
        where: { id },
        data,
      })
      return calendar
    }),

  // Delete an external calendar
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete all blocked dates from this calendar
      await ctx.prisma.blockedDate.deleteMany({
        where: { externalCalendarId: input.id },
      })

      // Delete the calendar
      await ctx.prisma.externalCalendar.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Sync a specific calendar
  sync: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const calendar = await ctx.prisma.externalCalendar.findUnique({
        where: { id: input.id },
      })

      if (!calendar) {
        throw new Error('Calendar not found')
      }

      try {
        // Fetch and parse the iCal feed
        const events = await ical.async.fromURL(calendar.icalUrl)

        const blockedDates: Array<{
          startDate: Date
          endDate: Date
          reason: string
          externalCalendarId: string
          externalEventId: string
        }> = []

        // Extract all VEVENT entries
        for (const event of Object.values(events)) {
          if (event.type === 'VEVENT' && event.start && event.end) {
            blockedDates.push({
              startDate: new Date(event.start),
              endDate: new Date(event.end),
              reason: `${calendar.name}: ${event.summary || 'Blocked'}`,
              externalCalendarId: calendar.id,
              externalEventId: event.uid || '',
            })
          }
        }

        // Delete old blocked dates from this calendar
        await ctx.prisma.blockedDate.deleteMany({
          where: { externalCalendarId: calendar.id },
        })

        // Create new blocked dates
        if (blockedDates.length > 0) {
          await ctx.prisma.blockedDate.createMany({
            data: blockedDates,
          })
        }

        // Update sync status
        await ctx.prisma.externalCalendar.update({
          where: { id: calendar.id },
          data: {
            lastSyncAt: new Date(),
            lastSyncStatus: 'SUCCESS',
            lastSyncError: null,
          },
        })

        return {
          success: true,
          syncedEvents: blockedDates.length,
          calendar,
        }
      } catch (error) {
        // Update with error status
        await ctx.prisma.externalCalendar.update({
          where: { id: calendar.id },
          data: {
            lastSyncAt: new Date(),
            lastSyncStatus: 'FAILED',
            lastSyncError: error instanceof Error ? error.message : String(error),
          },
        })

        throw new Error(
          `Failed to sync calendar: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }),

  // Sync all active calendars
  syncAll: publicProcedure.mutation(async ({ ctx }) => {
    const calendars = await ctx.prisma.externalCalendar.findMany({
      where: { isActive: true },
    })

    const results = []

    for (const calendar of calendars) {
      try {
        const events = await ical.async.fromURL(calendar.icalUrl)

        const blockedDates: Array<{
          startDate: Date
          endDate: Date
          reason: string
          externalCalendarId: string
          externalEventId: string
        }> = []

        for (const event of Object.values(events)) {
          if (event.type === 'VEVENT' && event.start && event.end) {
            blockedDates.push({
              startDate: new Date(event.start),
              endDate: new Date(event.end),
              reason: `${calendar.name}: ${event.summary || 'Blocked'}`,
              externalCalendarId: calendar.id,
              externalEventId: event.uid || '',
            })
          }
        }

        await ctx.prisma.blockedDate.deleteMany({
          where: { externalCalendarId: calendar.id },
        })

        if (blockedDates.length > 0) {
          await ctx.prisma.blockedDate.createMany({
            data: blockedDates,
          })
        }

        await ctx.prisma.externalCalendar.update({
          where: { id: calendar.id },
          data: {
            lastSyncAt: new Date(),
            lastSyncStatus: 'SUCCESS',
            lastSyncError: null,
          },
        })

        results.push({
          calendarId: calendar.id,
          name: calendar.name,
          success: true,
          syncedEvents: blockedDates.length,
        })
      } catch (error) {
        await ctx.prisma.externalCalendar.update({
          where: { id: calendar.id },
          data: {
            lastSyncAt: new Date(),
            lastSyncStatus: 'FAILED',
            lastSyncError: error instanceof Error ? error.message : String(error),
          },
        })

        results.push({
          calendarId: calendar.id,
          name: calendar.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    return results
  }),
})
