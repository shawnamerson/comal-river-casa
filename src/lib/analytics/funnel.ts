type FunnelEvent =
  | 'availability_check'
  | 'booking_started'
  | 'booking_created'
  | 'booking_completed'

interface FunnelOptions {
  bookingId?: string
  metadata?: Record<string, unknown>
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function trackFunnelEvent(event: FunnelEvent, options?: FunnelOptions) {
  if (typeof window === 'undefined') return

  // Skip tracking for admin users
  if (getCookie('_pv_exclude')) return

  // Read visitor ID from cookie (set by PageViewTracker), fall back to sessionStorage
  const sessionId = getCookie('_pv_vid') || sessionStorage.getItem('_pv_sid')
  if (!sessionId) return

  const payload = JSON.stringify({
    sessionId,
    event,
    bookingId: options?.bookingId,
    metadata: options?.metadata,
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/analytics/funnel',
      new Blob([payload], { type: 'application/json' })
    )
  } else {
    fetch('/api/analytics/funnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {}) // Fail silently
  }
}
