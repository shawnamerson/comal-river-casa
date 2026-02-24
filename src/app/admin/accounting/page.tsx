'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

export default function AccountingPage() {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [appliedStart, setAppliedStart] = useState<string | undefined>()
  const [appliedEnd, setAppliedEnd] = useState<string | undefined>()

  const { data, isLoading } = trpc.admin.getTransactions.useQuery({
    startDate: appliedStart,
    endDate: appliedEnd,
  })

  const handleFilter = () => {
    setAppliedStart(startDate || undefined)
    setAppliedEnd(endDate || undefined)
  }

  const handleClear = () => {
    setStartDate('')
    setEndDate('')
    setAppliedStart(undefined)
    setAppliedEnd(undefined)
  }

  const handleExportCSV = () => {
    if (!data) return
    const headers = ['Date', 'Type', 'Guest', 'Description', 'Amount', 'Booking ID']
    const rows = data.transactions.map((t) => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.type === 'payment' ? 'Payment' : t.type === 'refund' ? 'Refund' : 'Damage Charge',
      t.guestName,
      t.description,
      t.amount.toFixed(2),
      t.bookingId,
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `accounting-${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const typeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Payment</span>
      case 'refund':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Refund</span>
      case 'damage_charge':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">Damage Charge</span>
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-2">Accounting</h1>
          <p className="text-gray-600">Revenue breakdown and transaction history</p>
        </div>

        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Booking Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +${fmt(data.summary.bookingIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Refunds Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -${fmt(data.summary.refunds)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Damage Charges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  +${fmt(data.summary.damageIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Net Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold text-blue-600">
                  ${fmt(data.summary.netRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Date Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
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
              <Button onClick={handleFilter} size="sm">
                Filter
              </Button>
              {(appliedStart || appliedEnd) && (
                <Button onClick={handleClear} variant="outline" size="sm">
                  Clear
                </Button>
              )}
              <div className="ml-auto">
                <Button onClick={handleExportCSV} variant="outline" size="sm" disabled={!data?.transactions.length}>
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-gray-500 text-center py-8">Loading transactions...</p>
            ) : !data?.transactions.length ? (
              <p className="text-gray-500 text-center py-8">No transactions found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 font-medium text-gray-600">Date</th>
                      <th className="pb-3 font-medium text-gray-600">Type</th>
                      <th className="pb-3 font-medium text-gray-600">Guest</th>
                      <th className="pb-3 font-medium text-gray-600">Description</th>
                      <th className="pb-3 font-medium text-gray-600 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map((t, i) => (
                      <tr key={`${t.bookingId}-${t.type}-${i}`} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 whitespace-nowrap">
                          {format(new Date(t.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3">{typeBadge(t.type)}</td>
                        <td className="py-3">
                          <button
                            onClick={() => router.push(`/admin/bookings/${t.bookingId}`)}
                            className="text-blue-600 hover:underline"
                          >
                            {t.guestName}
                          </button>
                        </td>
                        <td className="py-3 text-gray-600">{t.description}</td>
                        <td className={`py-3 text-right font-medium whitespace-nowrap ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {t.amount >= 0 ? '+' : ''}{t.amount < 0 ? '-' : ''}${fmt(Math.abs(t.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
