'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker, DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BlockDatesPage() {
  const router = useRouter()
  const [range, setRange] = useState<DateRange | undefined>()
  const [reason, setReason] = useState('')

  const createBlockedDate = trpc.admin.createBlockedDate.useMutation({
    onSuccess: () => {
      alert('Dates blocked successfully!')
      router.push('/admin')
    },
    onError: (error) => {
      alert(`Error blocking dates: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!range?.from || !range?.to) {
      alert('Please select a date range')
      return
    }

    createBlockedDate.mutate({
      startDate: range.from.toISOString(),
      endDate: range.to.toISOString(),
      reason: reason || undefined,
    })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Block Dates</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Select a date range to block for maintenance or personal use. These dates will
              be unavailable for guest bookings.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Picker */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Select Date Range
                </label>
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  disabled={{ before: new Date() }}
                  numberOfMonths={2}
                  className="border rounded-lg p-3"
                />
              </div>

              {/* Selected Dates Display */}
              {range?.from && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm font-semibold text-blue-900 mb-1">
                    Selected Range:
                  </div>
                  <div className="text-blue-700">
                    {format(range.from, 'MMM dd, yyyy')}
                    {range.to && ` - ${format(range.to, 'MMM dd, yyyy')}`}
                  </div>
                </div>
              )}

              {/* Reason Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Maintenance, Personal use, Renovations"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!range?.from || !range?.to || createBlockedDate.isPending}
                >
                  {createBlockedDate.isPending ? 'Blocking...' : 'Block Dates'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
