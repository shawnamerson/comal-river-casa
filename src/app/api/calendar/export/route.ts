import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { PROPERTY } from '@/config/property'

export const dynamic = 'force-dynamic'

function formatDateToICal(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function formatDateOnly(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

export async function GET() {
  try {
    // Get all confirmed and pending bookings (not cancelled)
    const bookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
      orderBy: {
        checkIn: 'asc',
      },
    })

    // Get manually blocked dates (not imported from external calendars)
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        externalCalendarId: null,
      },
      orderBy: {
        startDate: 'asc',
      },
    })

    const now = new Date()
    const calendarName = `${PROPERTY.name} - Direct Bookings`

    // Build iCal content
    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Comal River Casa//Direct Bookings//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeICalText(calendarName)}`,
      `X-WR-TIMEZONE:America/Chicago`,
    ]

    // Add bookings
    for (const booking of bookings) {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      const created = new Date(booking.createdAt)

      const event = [
        'BEGIN:VEVENT',
        `UID:booking-${booking.id}@comalrivercasa.com`,
        `DTSTAMP:${formatDateToICal(now)}`,
        `DTSTART;VALUE=DATE:${formatDateOnly(checkIn)}`,
        `DTEND;VALUE=DATE:${formatDateOnly(checkOut)}`,
        `CREATED:${formatDateToICal(created)}`,
        `SUMMARY:Reserved`,
        `DESCRIPTION:Reserved`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        'END:VEVENT',
      ]

      ical = ical.concat(event)
    }

    // Add manually blocked dates
    for (const blocked of blockedDates) {
      const startDate = new Date(blocked.startDate)
      const endDate = new Date(blocked.endDate)
      const created = new Date(blocked.createdAt)

      const event = [
        'BEGIN:VEVENT',
        `UID:blocked-${blocked.id}@comalrivercasa.com`,
        `DTSTAMP:${formatDateToICal(now)}`,
        `DTSTART;VALUE=DATE:${formatDateOnly(startDate)}`,
        `DTEND;VALUE=DATE:${formatDateOnly(endDate)}`,
        `CREATED:${formatDateToICal(created)}`,
        `SUMMARY:${escapeICalText(blocked.reason || 'Blocked')}`,
        `DESCRIPTION:${escapeICalText(`Manually blocked dates`)}`,
        `STATUS:CONFIRMED`,
        `TRANSP:OPAQUE`,
        'END:VEVENT',
      ]

      ical = ical.concat(event)
    }

    ical.push('END:VCALENDAR')

    const icalContent = ical.join('\r\n')

    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bookings.ics"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generating iCal export:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar' },
      { status: 500 }
    )
  }
}
