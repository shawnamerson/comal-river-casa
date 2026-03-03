'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`
}

function getVisitorId(): string {
  if (typeof window === 'undefined') return ''
  let id = getCookie('_pv_vid')
  if (!id) {
    id = crypto.randomUUID()
    setCookie('_pv_vid', id, 365) // 1 year
  }
  // Keep sessionStorage in sync for funnel tracking
  sessionStorage.setItem('_pv_sid', id)
  return id
}

export function PageViewTracker() {
  const pathname = usePathname()
  const lastPath = useRef<string>('')

  useEffect(() => {
    // Set admin exclusion flag when visiting admin pages
    if (pathname.startsWith('/admin')) {
      setCookie('_pv_exclude', '1', 365)
      return
    }

    if (pathname.startsWith('/api')) return

    // Skip tracking for admin users
    if (getCookie('_pv_exclude')) return

    // Debounce: don't fire twice for the same path
    if (pathname === lastPath.current) return
    lastPath.current = pathname

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
      sessionId: getVisitorId(),
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
