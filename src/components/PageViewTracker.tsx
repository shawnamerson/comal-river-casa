'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('_pv_sid')
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem('_pv_sid', id)
  }
  return id
}

export function PageViewTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string>('')

  useEffect(() => {
    // Skip admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return

    // Debounce: don't fire twice for the same path
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
    })

    // Prefer sendBeacon for reliability (fires even on navigation)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/analytics/collect',
        new Blob([payload], { type: 'application/json' })
      )
    } else {
      fetch('/api/analytics/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {}) // Fail silently
    }
  }, [pathname])

  return null
}
