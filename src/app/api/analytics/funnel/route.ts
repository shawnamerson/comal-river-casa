import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'
import { auth } from '@/lib/auth'

const funnelLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1m'),
  prefix: 'rl:funnel',
})

const VALID_EVENTS = [
  'availability_check',
  'booking_started',
  'booking_created',
  'booking_completed',
] as const

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    const { success } = await funnelLimiter.limit(ip)
    if (!success) return new NextResponse(null, { status: 204 })

    const body = await request.json()
    const { sessionId, event, bookingId, metadata } = body as {
      sessionId?: string
      event?: string
      bookingId?: string
      metadata?: Record<string, unknown>
    }

    if (!sessionId || !event) {
      return new NextResponse(null, { status: 204 })
    }

    if (!VALID_EVENTS.includes(event as (typeof VALID_EVENTS)[number])) {
      return new NextResponse(null, { status: 204 })
    }

    // Skip signed-in admins regardless of device or exclusion cookie
    const session = await auth()
    if (session?.user?.role === 'ADMIN') {
      return new NextResponse(null, { status: 204 })
    }

    await prisma.funnelEvent.create({
      data: {
        sessionId,
        event,
        bookingId: bookingId || null,
        metadata: metadata
          ? (metadata as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Funnel event collect error:', error)
    return new NextResponse(null, { status: 204 }) // Fail silently
  }
}
