import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - 12)

    const result = await prisma.pageView.deleteMany({
      where: { timestamp: { lt: cutoff } },
    })

    return NextResponse.json({
      message: 'Analytics pruning complete',
      deletedCount: result.count,
      cutoffDate: cutoff.toISOString(),
      ranAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron prune-analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to prune analytics', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
