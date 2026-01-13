import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { fetchAndParseICal } from '@/lib/ical-parser'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron or has the correct secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

        const blockedDates = events.map((event) => ({
          startDate: event.start,
          endDate: event.end,
          reason: `${calendar.name}: ${event.summary || 'Blocked'}`,
          externalCalendarId: calendar.id,
          externalEventId: event.uid || '',
        }))

        // Delete old blocked dates from this calendar
        await prisma.blockedDate.deleteMany({
          where: { externalCalendarId: calendar.id },
        })

        // Create new blocked dates
        if (blockedDates.length > 0) {
          await prisma.blockedDate.createMany({
            data: blockedDates,
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
          syncedEvents: blockedDates.length,
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
      .reduce((sum, r) => sum + (r.success ? r.syncedEvents : 0), 0)

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
