import { describe, it, expect } from 'vitest'
import { parseICal } from '@/lib/ical-parser'

describe('parseICal', () => {
  it('parses a basic VEVENT with date-only format', () => {
    const ical = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:abc123',
      'SUMMARY:Airbnb Reservation',
      'DTSTART;VALUE=DATE:20260615',
      'DTEND;VALUE=DATE:20260618',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const events = parseICal(ical)
    expect(events).toHaveLength(1)
    expect(events[0].uid).toBe('abc123')
    expect(events[0].summary).toBe('Airbnb Reservation')
    expect(events[0].start.getFullYear()).toBe(2026)
    expect(events[0].start.getMonth()).toBe(5) // June = 5
    expect(events[0].start.getDate()).toBe(15)
    expect(events[0].end.getDate()).toBe(18)
  })

  it('parses a VEVENT with datetime format (UTC)', () => {
    const ical = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:def456',
      'SUMMARY:VRBO Booking',
      'DTSTART:20260701T160000Z',
      'DTEND:20260704T110000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const events = parseICal(ical)
    expect(events).toHaveLength(1)
    expect(events[0].uid).toBe('def456')
    expect(events[0].start.getUTCHours()).toBe(16)
    expect(events[0].end.getUTCHours()).toBe(11)
  })

  it('parses multiple events', () => {
    const ical = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:event1',
      'SUMMARY:Booking 1',
      'DTSTART;VALUE=DATE:20260601',
      'DTEND;VALUE=DATE:20260603',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:event2',
      'SUMMARY:Booking 2',
      'DTSTART;VALUE=DATE:20260610',
      'DTEND;VALUE=DATE:20260612',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const events = parseICal(ical)
    expect(events).toHaveLength(2)
    expect(events[0].uid).toBe('event1')
    expect(events[1].uid).toBe('event2')
  })

  it('skips events missing start or end date', () => {
    const ical = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:no-end',
      'SUMMARY:Missing End',
      'DTSTART;VALUE=DATE:20260601',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:complete',
      'SUMMARY:Complete Event',
      'DTSTART;VALUE=DATE:20260610',
      'DTEND;VALUE=DATE:20260612',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const events = parseICal(ical)
    expect(events).toHaveLength(1)
    expect(events[0].uid).toBe('complete')
  })

  it('defaults summary to "Reserved" when missing', () => {
    const ical = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:no-summary',
      'DTSTART;VALUE=DATE:20260601',
      'DTEND;VALUE=DATE:20260603',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const events = parseICal(ical)
    expect(events).toHaveLength(1)
    expect(events[0].summary).toBe('Reserved')
  })

  it('handles folded lines (line continuation)', () => {
    const ical = [
      'BEGIN:VCALENDAR',
      'BEGIN:VEVENT',
      'UID:folded-uid',
      'SUMMARY:A very long summary that has been',
      ' folded across multiple lines',
      'DTSTART;VALUE=DATE:20260601',
      'DTEND;VALUE=DATE:20260603',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const events = parseICal(ical)
    expect(events).toHaveLength(1)
    // Per iCal spec, the leading whitespace on the continuation line is the
    // fold indicator and gets stripped — no extra space is inserted.
    expect(events[0].summary).toBe(
      'A very long summary that has beenfolded across multiple lines'
    )
  })

  it('returns empty array for empty input', () => {
    expect(parseICal('')).toEqual([])
  })

  it('returns empty array for calendar with no events', () => {
    const ical = 'BEGIN:VCALENDAR\r\nEND:VCALENDAR'
    expect(parseICal(ical)).toEqual([])
  })
})
