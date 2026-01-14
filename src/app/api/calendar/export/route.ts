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

    for (const booking of bookings) {
      const checkIn = new Date(booking.checkIn)
      const checkOut = new Date(booking.checkOut)
      const created = new Date(booking.createdAt)

      // Use date-only format for all-day events (how Airbnb/VRBO expect them)
      const event = [
        'BEGIN:VEVENT',
        `UID:${booking.id}@comalrivercasa.com`,
        `DTSTAMP:${formatDateToICal(now)}`,
        `DTSTART;VALUE=DATE:${formatDateOnly(checkIn)}`,
        `DTEND;VALUE=DATE:${formatDateOnly(checkOut)}`,
        `CREATED:${formatDateToICal(created)}`,
        `SUMMARY:${escapeICalText(`Reserved - ${booking.guestName}`)}`,
        `DESCRIPTION:${escapeICalText(`Booking ID: ${booking.id}\\nGuest: ${booking.guestName}\\nGuests: ${booking.numberOfGuests}\\nStatus: ${booking.status}`)}`,
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
