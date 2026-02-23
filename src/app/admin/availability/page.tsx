'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, eachDayOfInterval, addDays, differenceInDays } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AvailabilityManagementPage() {
  const router = useRouter()
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single')
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>()
  const [blockReason, setBlockReason] = useState('')
  const [showBlockForm, setShowBlockForm] = useState(false)
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set())

  // Fetch data
  const { data: bookings } = trpc.admin.getAllBookings.useQuery()
  const { data: blockedDates, refetch: refetchBlocked } = trpc.admin.getBlockedDates.useQuery()

  // Mutations (no inline callbacks — success/error handled at call sites)
  const createBlockedDate = trpc.admin.createBlockedDate.useMutation()
  const deleteBlockedDate = trpc.admin.deleteBlockedDate.useMutation()

  // Booked dates for calendar display
  const bookedDates = useMemo(() => {
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
  }, [bookings])

  // Build blocked date set, date→range map, and Date[] for modifiers
  const { blockedDateSet, dateToBlockedRange, blockedDatesList } = useMemo(() => {
    const set = new Set<string>()
    const rangeMap = new Map<string, { id: string; startDate: string; endDate: string; reason?: string | null }>()
    const list: Date[] = []
    if (!blockedDates) return { blockedDateSet: set, dateToBlockedRange: rangeMap, blockedDatesList: list }
    for (const b of blockedDates) {
      const start = new Date(b.startDate)
      const end = new Date(b.endDate)
      const days = eachDayOfInterval({ start, end })
      for (const d of days) {
        const key = format(d, 'yyyy-MM-dd')
        set.add(key)
        rangeMap.set(key, b)
        list.push(d)
      }
    }
    return { blockedDateSet: set, dateToBlockedRange: rangeMap, blockedDatesList: list }
  }, [blockedDates])

  // Pending dates as Date[] for DayPicker modifiers
  const pendingDateObjects = useMemo(
    () => Array.from(pendingDates).map((d) => new Date(d + 'T00:00:00')),
    [pendingDates]
  )

  // Single-click handler: toggle block/unblock with range splitting
  const handleSingleDayClick = useCallback(async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (pendingDates.has(dateStr)) return

    const addPending = (key: string) =>
      setPendingDates((prev) => new Set(prev).add(key))
    const removePending = (key: string) =>
      setPendingDates((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })

    const isBlocked = blockedDateSet.has(dateStr)

    if (!isBlocked) {
      addPending(dateStr)
      try {
        const iso = new Date(dateStr + 'T00:00:00').toISOString()
        await createBlockedDate.mutateAsync({ startDate: iso, endDate: iso })
        await refetchBlocked()
      } finally {
        removePending(dateStr)
      }
    } else {
      const range = dateToBlockedRange.get(dateStr)
      if (!range) return

      addPending(dateStr)
      try {
        await deleteBlockedDate.mutateAsync({ id: range.id })

        const rangeStartStr = format(new Date(range.startDate), 'yyyy-MM-dd')
        const rangeEndStr = format(new Date(range.endDate), 'yyyy-MM-dd')

        if (rangeStartStr === rangeEndStr) {
          // Single-day range — already deleted
        } else if (dateStr === rangeStartStr) {
          const newStart = addDays(new Date(rangeStartStr + 'T00:00:00'), 1)
          await createBlockedDate.mutateAsync({
            startDate: newStart.toISOString(),
            endDate: new Date(rangeEndStr + 'T00:00:00').toISOString(),
            reason: range.reason || undefined,
          })
        } else if (dateStr === rangeEndStr) {
          const newEnd = addDays(new Date(rangeEndStr + 'T00:00:00'), -1)
          await createBlockedDate.mutateAsync({
            startDate: new Date(rangeStartStr + 'T00:00:00').toISOString(),
            endDate: newEnd.toISOString(),
            reason: range.reason || undefined,
          })
        } else {
          const newEnd1 = addDays(date, -1)
          const newStart2 = addDays(date, 1)
          await createBlockedDate.mutateAsync({
            startDate: new Date(rangeStartStr + 'T00:00:00').toISOString(),
            endDate: newEnd1.toISOString(),
            reason: range.reason || undefined,
          })
          await createBlockedDate.mutateAsync({
            startDate: newStart2.toISOString(),
            endDate: new Date(rangeEndStr + 'T00:00:00').toISOString(),
            reason: range.reason || undefined,
          })
        }

        await refetchBlocked()
      } finally {
        removePending(dateStr)
      }
    }
  }, [blockedDateSet, dateToBlockedRange, pendingDates, createBlockedDate, deleteBlockedDate, refetchBlocked])

  // Range block handler
  const handleBlockDates = async () => {
    if (!selectedRange?.from || !selectedRange?.to) {
      alert('Please select a date range')
      return
    }
    try {
      await createBlockedDate.mutateAsync({
        startDate: selectedRange.from.toISOString(),
        endDate: selectedRange.to.toISOString(),
        reason: blockReason || undefined,
      })
      await refetchBlocked()
      setSelectedRange(undefined)
      setBlockReason('')
      setShowBlockForm(false)
    } catch (error: any) {
      alert(`Error blocking dates: ${error.message}`)
    }
  }

  // Mode switching
  function handleSelectionModeChange(newMode: 'single' | 'range') {
    setSelectionMode(newMode)
    setSelectedRange(undefined)
    setShowBlockForm(false)
    setBlockReason('')
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
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

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
                <div className="flex items-center justify-between">
                  <CardTitle>Availability Calendar</CardTitle>
                  <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm shrink-0">
                    <button
                      onClick={() => handleSelectionModeChange('single')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        selectionMode === 'single'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Single dates
                    </button>
                    <button
                      onClick={() => handleSelectionModeChange('range')}
                      className={`px-4 py-2 font-medium transition-colors border-l border-gray-300 ${
                        selectionMode === 'range'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Date range
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {selectionMode === 'single'
                    ? 'Click any date to toggle it between available and blocked.'
                    : 'Select a date range, then block it below.'}
                </p>
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
                  .rdp-day.pending-day {
                    opacity: 0.5;
                    animation: pulse-pending 1.5s ease-in-out infinite;
                  }
                  @keyframes pulse-pending {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.2; }
                  }
                `}</style>

                {selectionMode === 'single' ? (
                  <DayPicker
                    numberOfMonths={3}
                    className="border rounded-lg p-3"
                    modifiers={{
                      booked: bookedDates,
                      blocked: blockedDatesList,
                      pending: pendingDateObjects,
                    }}
                    modifiersClassNames={{
                      booked: 'booked',
                      blocked: 'blocked',
                      pending: 'pending-day',
                    }}
                    onDayClick={handleSingleDayClick}
                  />
                ) : (
                  <DayPicker
                    mode="range"
                    selected={selectedRange}
                    onSelect={setSelectedRange}
                    numberOfMonths={3}
                    className="border rounded-lg p-3"
                    modifiers={{
                      booked: bookedDates,
                      blocked: blockedDatesList,
                    }}
                    modifiersClassNames={{
                      booked: 'booked',
                      blocked: 'blocked',
                    }}
                  />
                )}

                {selectionMode === 'range' && selectedRange?.from && selectedRange?.to && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-semibold text-blue-900 mb-1">
                          Selected Range:
                        </div>
                        <div className="text-blue-700">
                          {format(selectedRange.from, 'MMM dd, yyyy')} -{' '}
                          {format(selectedRange.to, 'MMM dd, yyyy')}{' '}
                          ({differenceInDays(selectedRange.to, selectedRange.from) + 1} days)
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
                    {blockedDates.map((bd) => (
                      <div
                        key={bd.id}
                        className="border rounded-lg p-3 bg-red-50"
                      >
                        <div className="text-sm font-semibold">
                          {format(new Date(bd.startDate), 'MMM dd')} -{' '}
                          {format(new Date(bd.endDate), 'MMM dd, yyyy')}
                        </div>
                        {bd.reason && (
                          <div className="text-xs text-gray-600 mt-1">
                            {bd.reason}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs"
                          onClick={async () => {
                            if (confirm('Remove this blocked date range?')) {
                              try {
                                await deleteBlockedDate.mutateAsync({ id: bd.id })
                                await refetchBlocked()
                              } catch (error: any) {
                                alert(`Error removing blocked date: ${error.message}`)
                              }
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
