'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, eachDayOfInterval, isSameDay } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

export default function AvailabilityManagementPage() {
  const router = useRouter()
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
  const [blockReason, setBlockReason] = useState('')
  const [showBlockForm, setShowBlockForm] = useState(false)

  // Fetch data
  const { data: bookings, refetch: refetchBookings } = trpc.admin.getAllBookings.useQuery()
  const { data: blockedDates, refetch: refetchBlocked } = trpc.admin.getBlockedDates.useQuery()

  // Mutations
  const createBlockedDate = trpc.admin.createBlockedDate.useMutation({
    onSuccess: () => {
      refetchBlocked()
      setSelectedRange(undefined)
      setBlockReason('')
      setShowBlockForm(false)
      alert('Dates blocked successfully!')
    },
    onError: (error) => {
      alert(`Error blocking dates: ${error.message}`)
    },
  })

  const deleteBlockedDate = trpc.admin.deleteBlockedDate.useMutation({
    onSuccess: () => {
      refetchBlocked()
      alert('Blocked date removed successfully!')
    },
    onError: (error) => {
      alert(`Error removing blocked date: ${error.message}`)
    },
  })

  // Calculate disabled and styled dates
  const getBookedDates = () => {
    if (!bookings) return []
    const dates: Date[] = []
    bookings
      .filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
      .forEach((booking) => {
        const range = eachDayOfInterval({
          start: new Date(booking.checkIn),
          end: new Date(booking.checkOut),
        })
        dates.push(...range)
      })
    return dates
  }

  const getBlockedDatesList = () => {
    if (!blockedDates) return []
    const dates: Date[] = []
    blockedDates.forEach((blocked) => {
      const range = eachDayOfInterval({
        start: new Date(blocked.startDate),
        end: new Date(blocked.endDate),
      })
      dates.push(...range)
    })
    return dates
  }

  const bookedDates = getBookedDates()
  const blocked = getBlockedDatesList()

  const handleBlockDates = () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      alert('Please select a date range')
      return
    }

    createBlockedDate.mutate({
      startDate: selectedRange.from.toISOString(),
      endDate: selectedRange.to.toISOString(),
      reason: blockReason || undefined,
    })
  }

  // Stats
  const upcomingBookings = bookings?.filter(
    (b) =>
      (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
      new Date(b.checkIn) > new Date()
  ).length || 0

  const currentBookings = bookings?.filter(
    (b) =>
      b.status === 'CONFIRMED' &&
      new Date(b.checkIn) <= new Date() &&
      new Date(b.checkOut) >= new Date()
  ).length || 0

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Button variant="outline" onClick={() => router.push('/admin')}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Availability Management</h1>
          <p className="text-gray-600">
            View all bookings and blocked dates in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{bookings?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {upcomingBookings}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Current Guests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {currentBookings}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Blocked Periods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {blockedDates?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Availability Calendar</CardTitle>
                <div className="flex gap-4 text-sm mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 border border-green-600 rounded"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 border border-red-600 rounded"></div>
                    <span>Blocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                    <span>Available</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <style jsx global>{`
                  .rdp-day.booked {
                    background-color: #bbf7d0 !important;
                    border: 2px solid #16a34a !important;
                    color: #166534 !important;
                    font-weight: 600;
                  }
                  .rdp-day.blocked {
                    background-color: #fecaca !important;
                    border: 2px solid #dc2626 !important;
                    color: #991b1b !important;
                    font-weight: 600;
                  }
                  .rdp-day.booked:hover,
                  .rdp-day.blocked:hover {
                    opacity: 0.8;
                  }
                `}</style>

                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  numberOfMonths={3}
                  className="border rounded-lg p-3"
                  modifiers={{
                    booked: bookedDates,
                    blocked: blocked,
                  }}
                  modifiersClassNames={{
                    booked: 'booked',
                    blocked: 'blocked',
                  }}
                />

                {selectedRange?.from && selectedRange?.to && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-blue-900 mb-1">
                          Selected Range:
                        </div>
                        <div className="text-blue-700">
                          {format(selectedRange.from, 'MMM dd, yyyy')} -{' '}
                          {format(selectedRange.to, 'MMM dd, yyyy')}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setShowBlockForm(!showBlockForm)}
                      >
                        {showBlockForm ? 'Cancel' : 'Block These Dates'}
                      </Button>
                    </div>

                    {showBlockForm && (
                      <div className="mt-4 space-y-3">
                        <input
                          type="text"
                          placeholder="Reason (optional)"
                          className="w-full px-3 py-2 border rounded-lg"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            onClick={handleBlockDates}
                            disabled={createBlockedDate.isPending}
                          >
                            {createBlockedDate.isPending
                              ? 'Blocking...'
                              : 'Confirm Block'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowBlockForm(false)
                              setBlockReason('')
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Lists */}
          <div className="space-y-6">
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {!bookings ||
                bookings.filter(
                  (b) =>
                    (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
                    new Date(b.checkIn) > new Date()
                ).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No upcoming bookings
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookings
                      .filter(
                        (b) =>
                          (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
                          new Date(b.checkIn) > new Date()
                      )
                      .slice(0, 5)
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="border rounded-lg p-3 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                        >
                          <div className="font-semibold">{booking.guestName}</div>
                          <div className="text-gray-600 text-xs">
                            {format(new Date(booking.checkIn), 'MMM dd')} -{' '}
                            {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                          </div>
                          <div
                            className={`text-xs mt-1 ${
                              booking.status === 'CONFIRMED'
                                ? 'text-green-600'
                                : 'text-yellow-600'
                            }`}
                          >
                            {booking.status}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blocked Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Blocked Dates</CardTitle>
              </CardHeader>
              <CardContent>
                {!blockedDates || blockedDates.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No blocked dates
                  </p>
                ) : (
                  <div className="space-y-3">
                    {blockedDates.map((blocked) => (
                      <div
                        key={blocked.id}
                        className="border rounded-lg p-3 bg-red-50"
                      >
                        <div className="text-sm font-semibold">
                          {format(new Date(blocked.startDate), 'MMM dd')} -{' '}
                          {format(new Date(blocked.endDate), 'MMM dd, yyyy')}
                        </div>
                        {blocked.reason && (
                          <div className="text-xs text-gray-600 mt-1">
                            {blocked.reason}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs"
                          onClick={() => {
                            if (confirm('Remove this blocked date range?')) {
                              deleteBlockedDate.mutate({ id: blocked.id })
                            }
                          }}
                          disabled={deleteBlockedDate.isPending}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
