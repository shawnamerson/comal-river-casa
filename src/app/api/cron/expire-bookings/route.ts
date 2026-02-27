import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { cancelExpiredPendingBookings } from '@/server/routers/booking'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cancelledCount = await cancelExpiredPendingBookings(prisma)

    return NextResponse.json({
      message: 'Expired booking cleanup complete',
      cancelledCount: cancelledCount ?? 0,
      ranAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron expire-bookings error:', error)
    return NextResponse.json(
      { error: 'Failed to expire bookings', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
