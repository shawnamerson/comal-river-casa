import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { prisma } from '@/lib/db/prisma'

const dateRangeInput = z.object({
  startDate: z.string(), // ISO date string e.g. "2025-01-01"
  endDate: z.string(),
})

function dateRange(input: z.infer<typeof dateRangeInput>) {
  return {
    timestamp: {
      gte: new Date(input.startDate),
      lte: new Date(input.endDate + 'T23:59:59.999Z'),
    },
  }
}

export const analyticsRouter = router({
  overview: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const where = dateRange(input)

    const [totalViews, uniqueVisitors] = await Promise.all([
      prisma.pageView.count({ where }),
      prisma.pageView
        .groupBy({ by: ['sessionId'], where: { ...where, sessionId: { not: null } } })
        .then((r) => r.length),
    ])

    // Pages per session
    const pagesPerSession = uniqueVisitors > 0 ? totalViews / uniqueVisitors : 0

    // Bounce rate: sessions with exactly 1 page view
    const sessionCounts = await prisma.pageView.groupBy({
      by: ['sessionId'],
      where: { ...where, sessionId: { not: null } },
      _count: { id: true },
    })
    const bounces = sessionCounts.filter((s) => s._count.id === 1).length
    const bounceRate = sessionCounts.length > 0 ? bounces / sessionCounts.length : 0

    return {
      totalViews,
      uniqueVisitors,
      pagesPerSession: Math.round(pagesPerSession * 10) / 10,
      bounceRate: Math.round(bounceRate * 1000) / 10, // percentage with 1 decimal
    }
  }),

  pageViewsTimeseries: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const where = dateRange(input)

    const views = await prisma.pageView.findMany({
      where,
      select: { timestamp: true, sessionId: true },
      orderBy: { timestamp: 'asc' },
    })

    // Group by day
    const dayMap = new Map<string, { views: number; visitors: Set<string> }>()

    for (const v of views) {
      const day = v.timestamp.toISOString().slice(0, 10)
      if (!dayMap.has(day)) {
        dayMap.set(day, { views: 0, visitors: new Set() })
      }
      const entry = dayMap.get(day)!
      entry.views++
      if (v.sessionId) entry.visitors.add(v.sessionId)
    }

    // Fill in missing days
    const start = new Date(input.startDate)
    const end = new Date(input.endDate)
    const result: { date: string; views: number; visitors: number }[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10)
      const entry = dayMap.get(key)
      result.push({
        date: key,
        views: entry?.views ?? 0,
        visitors: entry?.visitors.size ?? 0,
      })
    }

    return result
  }),

  topPages: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const where = dateRange(input)

    const pages = await prisma.pageView.groupBy({
      by: ['path'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    // Get unique visitors per page
    const result = await Promise.all(
      pages.map(async (p) => {
        const visitors = await prisma.pageView.groupBy({
          by: ['sessionId'],
          where: { ...where, path: p.path, sessionId: { not: null } },
        })
        return {
          path: p.path,
          views: p._count.id,
          visitors: visitors.length,
        }
      })
    )

    return result
  }),

  topReferrers: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const where = dateRange(input)

    const referrers = await prisma.pageView.groupBy({
      by: ['referrer'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    })

    return referrers.map((r) => ({
      referrer: r.referrer || 'Direct',
      views: r._count.id,
    }))
  }),

  devices: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const where = dateRange(input)

    const [deviceTypes, browsers, operatingSystems] = await Promise.all([
      prisma.pageView.groupBy({
        by: ['deviceType'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.pageView.groupBy({
        by: ['browser'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
      prisma.pageView.groupBy({
        by: ['os'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 8,
      }),
    ])

    return {
      deviceTypes: deviceTypes.map((d) => ({
        name: d.deviceType || 'Unknown',
        count: d._count.id,
      })),
      browsers: browsers.map((b) => ({
        name: b.browser || 'Unknown',
        count: b._count.id,
      })),
      os: operatingSystems.map((o) => ({
        name: o.os || 'Unknown',
        count: o._count.id,
      })),
    }
  }),

  geography: adminProcedure.input(dateRangeInput).query(async ({ input }) => {
    const where = dateRange(input)

    const countries = await prisma.pageView.groupBy({
      by: ['country'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 15,
    })

    return countries.map((c) => ({
      country: c.country || 'Unknown',
      views: c._count.id,
    }))
  }),
})
