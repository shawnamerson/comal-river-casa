'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

function formatDateInput(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export default function AnalyticsPage() {
  const router = useRouter()
  const today = useMemo(() => new Date(), [])

  const [startDate, setStartDate] = useState(formatDateInput(subDays(today, 30)))
  const [endDate, setEndDate] = useState(formatDateInput(today))

  const dateInput = { startDate, endDate }

  const { data: overview, isLoading: overviewLoading, error: overviewError } = trpc.analytics.overview.useQuery(dateInput)
  const { data: funnel } = trpc.analytics.bookingFunnel.useQuery(dateInput)
  const { data: timeseries } = trpc.analytics.pageViewsTimeseries.useQuery(dateInput)
  const { data: topPages } = trpc.analytics.topPages.useQuery(dateInput)
  const { data: topReferrers } = trpc.analytics.topReferrers.useQuery(dateInput)
  const { data: devices } = trpc.analytics.devices.useQuery(dateInput)
  const { data: geography } = trpc.analytics.geography.useQuery(dateInput)

  const setRange = (days: number) => {
    setStartDate(formatDateInput(subDays(today, days)))
    setEndDate(formatDateInput(today))
  }

  const hasData = overview && overview.totalViews > 0

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-gray-600">Site traffic and visitor insights</p>
        </div>

        {/* Date Range Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex gap-2">
                <Button
                  variant={startDate === formatDateInput(subDays(today, 7)) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRange(7)}
                >
                  7d
                </Button>
                <Button
                  variant={startDate === formatDateInput(subDays(today, 30)) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRange(30)}
                >
                  30d
                </Button>
                <Button
                  variant={startDate === formatDateInput(subDays(today, 90)) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRange(90)}
                >
                  90d
                </Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {overviewLoading ? (
          <p className="text-gray-500 text-center py-12">Loading analytics...</p>
        ) : !hasData ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-gray-500 text-lg mb-2">No analytics data yet</p>
              <p className="text-gray-400 text-sm">
                Page views will appear here once visitors start browsing the site.
              </p>
              {overviewError && (
                <p className="text-red-500 text-sm mt-4">
                  Error: {overviewError.message}
                </p>
              )}
              {overview && (
                <p className="text-gray-400 text-xs mt-4">
                  Debug: totalViews={overview.totalViews}, range={startDate} to {endDate}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Page Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{overview.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Unique Visitors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {overview.uniqueVisitors.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Pages / Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{overview.pagesPerSession}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Bounce Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{overview.bounceRate}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Funnel */}
            {funnel && funnel.steps.some((s) => s.sessions > 0) && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Booking Funnel</CardTitle>
                    <span className="text-sm font-medium text-gray-600">
                      Overall conversion: <span className="text-blue-600 font-bold">{funnel.overallConversion}%</span>
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-56 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={funnel.steps.map((s) => ({
                          ...s,
                          label: s.event
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (c) => c.toUpperCase()),
                        }))}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" fontSize={12} />
                        <YAxis
                          type="category"
                          dataKey="label"
                          fontSize={12}
                          width={140}
                        />
                        <Tooltip />
                        <Bar dataKey="sessions" fill="#3b82f6" name="Sessions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium text-gray-600">Step</th>
                        <th className="pb-2 font-medium text-gray-600 text-right">Sessions</th>
                        <th className="pb-2 font-medium text-gray-600 text-right">Conversion %</th>
                        <th className="pb-2 font-medium text-gray-600 text-right">Drop-off %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funnel.steps.map((step) => (
                        <tr key={step.event} className="border-b last:border-0">
                          <td className="py-2 capitalize">
                            {step.event.replace(/_/g, ' ')}
                          </td>
                          <td className="py-2 text-right">{step.sessions.toLocaleString()}</td>
                          <td className="py-2 text-right text-green-600">{step.conversionRate}%</td>
                          <td className="py-2 text-right text-red-600">{step.dropOff}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            {/* Timeseries Chart */}
            {timeseries && timeseries.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Page Views Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeseries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d: string) => format(new Date(d + 'T00:00:00'), 'MMM d')}
                          fontSize={12}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip
                          labelFormatter={(d) =>
                            format(new Date(String(d) + 'T00:00:00'), 'MMM d, yyyy')
                          }
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                          name="Page Views"
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                          name="Visitors"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Pages & Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {topPages && topPages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Pages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium text-gray-600">Path</th>
                          <th className="pb-2 font-medium text-gray-600 text-right">Views</th>
                          <th className="pb-2 font-medium text-gray-600 text-right">Visitors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPages.map((p) => (
                          <tr key={p.path} className="border-b last:border-0">
                            <td className="py-2 font-mono text-xs">{p.path}</td>
                            <td className="py-2 text-right">{p.views.toLocaleString()}</td>
                            <td className="py-2 text-right">{p.visitors.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}

              {topReferrers && topReferrers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Referrers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium text-gray-600">Referrer</th>
                          <th className="pb-2 font-medium text-gray-600 text-right">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topReferrers.map((r) => (
                          <tr key={r.referrer} className="border-b last:border-0">
                            <td className="py-2 text-xs truncate max-w-[300px]">{r.referrer}</td>
                            <td className="py-2 text-right">{r.views.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Device / Browser / OS Charts */}
            {devices && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Device Type Pie */}
                <Card>
                  <CardHeader>
                    <CardTitle>Device Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={devices.deviceTypes}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) =>
                              `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
                            }
                          >
                            {devices.deviceTypes.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Browser Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Browsers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={devices.browsers} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            fontSize={12}
                            width={80}
                            tickFormatter={(v: string) =>
                              v.length > 10 ? v.slice(0, 10) + '...' : v
                            }
                          />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" name="Views" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* OS Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Operating Systems</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={devices.os} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" fontSize={12} />
                          <YAxis
                            type="category"
                            dataKey="name"
                            fontSize={12}
                            width={80}
                            tickFormatter={(v: string) =>
                              v.length > 10 ? v.slice(0, 10) + '...' : v
                            }
                          />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" name="Views" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Geography */}
            {geography && geography.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 font-medium text-gray-600">Country</th>
                        <th className="pb-2 font-medium text-gray-600 text-right">Page Views</th>
                      </tr>
                    </thead>
                    <tbody>
                      {geography.map((g) => (
                        <tr key={g.country} className="border-b last:border-0">
                          <td className="py-2">{g.country}</td>
                          <td className="py-2 text-right">{g.views.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  )
}
