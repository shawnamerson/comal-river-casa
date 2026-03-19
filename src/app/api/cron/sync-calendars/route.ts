import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { fetchAndParseICal } from '@/lib/ical-parser'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron or has the correct secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const calendars = await prisma.externalCalendar.findMany({
      where: { isActive: true },
    })

    const results = []

    for (const calendar of calendars) {
      try {
        const events = await fetchAndParseICal(calendar.icalUrl)

        const incomingEvents = events.map((event) => ({
          startDate: event.start,
          endDate: event.end,
          reason: `${calendar.name}: ${event.summary || 'Blocked'}`,
          externalCalendarId: calendar.id,
          externalEventId: event.uid || '',
        }))

        // Incremental sync: compare with existing blocked dates
        const existing = await prisma.blockedDate.findMany({
          where: { externalCalendarId: calendar.id },
        })

        const existingByUid = new Map(existing.map((e) => [e.externalEventId, e]))
        const incomingUids = new Set(incomingEvents.map((e) => e.externalEventId))

        // Delete events no longer in the calendar
        const toDelete = existing.filter((e) => e.externalEventId && !incomingUids.has(e.externalEventId))
        if (toDelete.length > 0) {
          await prisma.blockedDate.deleteMany({
            where: { id: { in: toDelete.map((e) => e.id) } },
          })
        }

        // Upsert new/changed events
        for (const event of incomingEvents) {
          const existingEvent = existingByUid.get(event.externalEventId)
          if (
            existingEvent &&
            existingEvent.startDate.getTime() === event.startDate.getTime() &&
            existingEvent.endDate.getTime() === event.endDate.getTime() &&
            existingEvent.reason === event.reason
          ) {
            continue // unchanged, skip
          }
          await prisma.blockedDate.upsert({
            where: {
              externalCalendarId_externalEventId: {
                externalCalendarId: calendar.id,
                externalEventId: event.externalEventId,
              },
            },
            update: {
              startDate: event.startDate,
              endDate: event.endDate,
              reason: event.reason,
            },
            create: event,
          })
        }

        // Update sync status
        await prisma.externalCalendar.update({
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
          syncedEvents: incomingEvents.length,
        })
      } catch (error) {
        await prisma.externalCalendar.update({
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

    const successCount = results.filter((r) => r.success).length
    const failCount = results.filter((r) => !r.success).length
    const totalEvents = results
      .filter((r) => r.success)
      .reduce((sum, r) => sum + (r.syncedEvents ?? 0), 0)

    return NextResponse.json({
      message: 'Calendar sync complete',
      syncedAt: new Date().toISOString(),
      summary: {
        total: calendars.length,
        successful: successCount,
        failed: failCount,
        totalEvents,
      },
      results,
    })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendars', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
