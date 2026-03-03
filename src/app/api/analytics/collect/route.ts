import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { UAParser } from 'ua-parser-js'

const BOT_PATTERN =
  /bot|crawl|spider|slurp|facebookexternalhit|baiduspider|yandex|duckduck|google|bing|yahoo|semrush|ahref|lighthouse|pagespeed|gtmetrix|pingdom|uptime/i

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, referrer, sessionId } = body as {
      path?: string
      referrer?: string
      sessionId?: string
    }

    if (!path) {
      return new NextResponse(null, { status: 204 })
    }

    // Skip admin and API routes
    if (path.startsWith('/admin') || path.startsWith('/api')) {
      return new NextResponse(null, { status: 204 })
    }

    // Skip bots
    const userAgent = request.headers.get('user-agent') || ''
    if (BOT_PATTERN.test(userAgent)) {
      return new NextResponse(null, { status: 204 })
    }

    // Parse user agent
    const parser = new UAParser(userAgent)
    const browser = parser.getBrowser().name || null
    const os = parser.getOS().name || null
    const deviceType = parser.getDevice().type || 'desktop' // ua-parser-js returns undefined for desktops

    // Read Vercel geo headers
    const country = request.headers.get('x-vercel-ip-country') || null
    const region = request.headers.get('x-vercel-ip-country-region') || null
    const city = request.headers.get('x-vercel-ip-city') || null

    await prisma.pageView.create({
      data: {
        sessionId: sessionId || null,
        path,
        referrer: referrer || null,
        country,
        region,
        city,
        deviceType,
        browser,
        os,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Analytics collect error:', error)
    return new NextResponse(null, { status: 204 }) // Fail silently — analytics should never break UX
  }
}
