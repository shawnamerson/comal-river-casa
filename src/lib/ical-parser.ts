/**
 * Simple iCal parser for extracting VEVENT entries
 * Avoids the BigInt issues with node-ical in Next.js
 */

export interface ICalEvent {
  uid: string
  summary: string
  start: Date
  end: Date
}

function parseICalDate(dateStr: string): Date {
  // Handle various iCal date formats
  // YYYYMMDD or YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
  const cleaned = dateStr.replace(/[^0-9T]/g, '')

  if (cleaned.length === 8) {
    // YYYYMMDD format
    const year = parseInt(cleaned.slice(0, 4))
    const month = parseInt(cleaned.slice(4, 6)) - 1
    const day = parseInt(cleaned.slice(6, 8))
    return new Date(year, month, day)
  } else if (cleaned.length >= 15) {
    // YYYYMMDDTHHMMSS format
    const year = parseInt(cleaned.slice(0, 4))
    const month = parseInt(cleaned.slice(4, 6)) - 1
    const day = parseInt(cleaned.slice(6, 8))
    const hour = parseInt(cleaned.slice(9, 11))
    const minute = parseInt(cleaned.slice(11, 13))
    const second = parseInt(cleaned.slice(13, 15))
    return new Date(Date.UTC(year, month, day, hour, minute, second))
  }

  // Fallback to standard Date parsing
  return new Date(dateStr)
}

function unfoldLines(icalText: string): string {
  // iCal spec allows long lines to be folded with CRLF followed by whitespace
  return icalText.replace(/\r?\n[ \t]/g, '')
}

export function parseICal(icalText: string): ICalEvent[] {
  const events: ICalEvent[] = []
  const unfolded = unfoldLines(icalText)
  const lines = unfolded.split(/\r?\n/)

  let currentEvent: Partial<ICalEvent> | null = null

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine === 'BEGIN:VEVENT') {
      currentEvent = {}
    } else if (trimmedLine === 'END:VEVENT') {
      if (currentEvent && currentEvent.start && currentEvent.end) {
        events.push({
          uid: currentEvent.uid || '',
          summary: currentEvent.summary || 'Reserved',
          start: currentEvent.start,
          end: currentEvent.end,
        })
      }
      currentEvent = null
    } else if (currentEvent) {
      // Parse property:value pairs
      const colonIndex = trimmedLine.indexOf(':')
      if (colonIndex > 0) {
        const propertyPart = trimmedLine.slice(0, colonIndex)
        const value = trimmedLine.slice(colonIndex + 1)

        // Property might have parameters like DTSTART;VALUE=DATE:20240101
        const property = propertyPart.split(';')[0].toUpperCase()

        switch (property) {
          case 'UID':
            currentEvent.uid = value
            break
          case 'SUMMARY':
            currentEvent.summary = value
            break
          case 'DTSTART':
            currentEvent.start = parseICalDate(value)
            break
          case 'DTEND':
            currentEvent.end = parseICalDate(value)
            break
        }
      }
    }
  }

  return events
}

export async function fetchAndParseICal(url: string): Promise<ICalEvent[]> {
  // Reject non-HTTPS URLs to prevent SSRF via http://, file://, etc.
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:') {
    throw new Error('Only HTTPS iCal URLs are supported')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000) // 10s timeout

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ComalRiverCasa/1.0',
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout))

  if (!response.ok) {
    throw new Error(`Failed to fetch iCal: ${response.status} ${response.statusText}`)
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > 1_000_000) {
    throw new Error('iCal response too large (>1MB)')
  }

  const text = await response.text()
  if (text.length > 1_000_000) {
    throw new Error('iCal response too large (>1MB)')
  }

  return parseICal(text)
}
