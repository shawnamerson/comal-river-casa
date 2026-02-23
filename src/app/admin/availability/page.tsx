'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import type { DayMouseEventHandler, DateRange } from 'react-day-picker'
import {
  format,
  eachDayOfInterval,
  addDays,
  differenceInDays,
  startOfMonth,
  addMonths,
  startOfToday,
  isAfter,
  isBefore,
} from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function parseLocalDate(s: string): Date {
  return new Date(s.slice(0, 10) + 'T00:00:00')
}

function blockStatus(startDate: string, endDate: string): { label: string; classes: string } {
  const today = startOfToday()
  const start = parseLocalDate(startDate)
  const end = parseLocalDate(endDate)
  if (isAfter(start, today)) return { label: 'Upcoming', classes: 'bg-blue-50 text-blue-700' }
  if (isBefore(end, today)) return { label: 'Past', classes: 'bg-gray-100 text-gray-500' }
  return { label: 'Active', classes: 'bg-orange-100 text-orange-700' }
}

export default function AvailabilityManagementPage() {
  const router = useRouter()
  const [selectionMode, setSelectionMode] = useState<'single' | 'range'>('single')
  const [rangeSelection, setRangeSelection] = useState<DateRange | undefined>()
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set())
  const [lastAction, setLastAction] = useState<string | null>(null)

  useEffect(() => {
    if (!lastAction) return
    const t = setTimeout(() => setLastAction(null), 4000)
    return () => clearTimeout(t)
  }, [lastAction])

  // Fetch data
  const { data: bookings } = trpc.admin.getAllBookings.useQuery()
  const { data: blockedDates, refetch: refetchBlocked } = trpc.admin.getBlockedDates.useQuery()

  // Mutations
  const createBlockedDate = trpc.admin.createBlockedDate.useMutation()
  const deleteBlockedDate = trpc.admin.deleteBlockedDate.useMutation({ onSuccess: () => refetchBlocked() })

  const today = startOfToday()
  const calendarStart = startOfMonth(today)
  const calendarEnd = addMonths(calendarStart, 11)

  // Booked dates for calendar display (green modifier)
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

  // Build blocked date set, reason map, and date→range map
  const { blockedDateSet, blockedReasonMap, dateToBlockedRange } = useMemo(() => {
    const set = new Set<string>()
    const reasonMap = new Map<string, string>()
    const rangeMap = new Map<string, { id: string; startDate: string; endDate: string; reason?: string | null }>()
    if (!blockedDates) return { blockedDateSet: set, blockedReasonMap: reasonMap, dateToBlockedRange: rangeMap }
    for (const b of blockedDates) {
      const start = parseLocalDate(b.startDate)
      const end = parseLocalDate(b.endDate)
      const days = eachDayOfInterval({ start, end })

      // For external calendar imports, show short platform label
      let label = b.reason || ''
      if (b.externalCalendarId && b.reason) {
        const name = b.reason.split(':')[0].trim().toLowerCase()
        if (name.startsWith('airbnb')) label = 'Airbnb'
        else if (name.startsWith('vrbo')) label = 'VRBO'
        else label = b.reason.split(':')[0].trim()
      }

      for (const d of days) {
        const key = format(d, 'yyyy-MM-dd')
        set.add(key)
        if (label) reasonMap.set(key, label)
        rangeMap.set(key, b)
      }
    }
    return { blockedDateSet: set, blockedReasonMap: reasonMap, dateToBlockedRange: rangeMap }
  }, [blockedDates])

  // Dates to highlight as blocked on the calendar
  const blockedCalendarDates = useMemo(
    () => Array.from(blockedDateSet).map((d) => new Date(d + 'T00:00:00')),
    [blockedDateSet]
  )

  // Pending dates as Date[] for DayPicker modifiers
  const pendingDateObjects = useMemo(
    () => Array.from(pendingDates).map((d) => new Date(d + 'T00:00:00')),
    [pendingDates]
  )

  // Single-click handler: toggle block/unblock with range splitting
  const handleDayClick: DayMouseEventHandler = useCallback(async (date, modifiers) => {
    if (modifiers.disabled) return

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
      } catch (e: any) {
        setLastAction(e?.message ?? 'Failed to block date')
      } finally {
        removePending(dateStr)
      }
    } else {
      const range = dateToBlockedRange.get(dateStr)
      if (!range) return

      addPending(dateStr)
      try {
        await deleteBlockedDate.mutateAsync({ id: range.id })

        const rangeStartStr = format(parseLocalDate(range.startDate), 'yyyy-MM-dd')
        const rangeEndStr = format(parseLocalDate(range.endDate), 'yyyy-MM-dd')

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
      } catch (e: any) {
        setLastAction(e?.message ?? 'Failed to unblock date')
      } finally {
        removePending(dateStr)
      }
    }
  }, [blockedDateSet, dateToBlockedRange, pendingDates, createBlockedDate, deleteBlockedDate, refetchBlocked])

  // Range block handler
  const [blockingRange, setBlockingRange] = useState(false)

  async function handleBlockRange() {
    if (!rangeSelection?.from || !rangeSelection?.to) return
    setBlockingRange(true)
    try {
      await createBlockedDate.mutateAsync({
        startDate: rangeSelection.from.toISOString(),
        endDate: rangeSelection.to.toISOString(),
      })
      await refetchBlocked()
      setRangeSelection(undefined)
      setLastAction(`Blocked ${format(rangeSelection.from, 'MMM d, yyyy')} — ${format(rangeSelection.to, 'MMM d, yyyy')}`)
    } catch (e: any) {
      setLastAction(e?.message ?? 'Failed to block range')
    } finally {
      setBlockingRange(false)
    }
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

  // Blocked dates list split
  const { upcoming, past } = useMemo(() => {
    if (!blockedDates) return { upcoming: [], past: [] }
    const upcoming = blockedDates
      .filter((b) => !isBefore(parseLocalDate(b.endDate), today))
      .sort((a, b) => parseLocalDate(a.startDate).getTime() - parseLocalDate(b.startDate).getTime())
    const past = blockedDates
      .filter((b) => isBefore(parseLocalDate(b.endDate), today))
      .sort((a, b) => parseLocalDate(b.startDate).getTime() - parseLocalDate(a.startDate).getTime())
    return { upcoming, past }
  }, [blockedDates, today])

  // DayButton for availability calendar
  const AvailDayButton = ({ day, modifiers, children, ...props }: any) => {
    const dateStr = format(day.date, 'yyyy-MM-dd')
    const isBlocked = blockedDateSet.has(dateStr)
    const isPending = pendingDates.has(dateStr)
    const isDisabled = modifiers?.disabled
    const reasonLabel = blockedReasonMap.get(dateStr)

    return (
      <button {...props}>
        {isPending ? '...' : children}
        {!isDisabled && !isPending && isBlocked && (
          <span className="block text-[8px] leading-tight font-medium text-red-600 truncate max-w-full">
            {reasonLabel || 'blocked'}
          </span>
        )}
      </button>
    )
  }

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

        {/* 12-month Availability Calendar */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Availability Calendar</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {selectionMode === 'single'
                    ? 'Click any date to toggle it between available and blocked.'
                    : 'Click a start date, then an end date to select a range to block.'}
                </p>
              </div>
              <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => { setSelectionMode('single'); setRangeSelection(undefined) }}
                  className={`flex-1 sm:flex-initial px-4 py-2 font-medium transition-colors ${
                    selectionMode === 'single'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Single dates
                </button>
                <button
                  onClick={() => { setSelectionMode('range'); setRangeSelection(undefined) }}
                  className={`flex-1 sm:flex-initial px-4 py-2 font-medium transition-colors border-l border-gray-300 ${
                    selectionMode === 'range'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Date range
                </button>
              </div>
            </div>
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
            <style>{`
              .avail-calendar {
                overflow: hidden;
              }
              .avail-calendar .rdp-root {
                --rdp-cell-size: 2.25rem;
                width: 100%;
              }
              .avail-calendar .rdp-months {
                display: grid !important;
                grid-template-columns: repeat(1, minmax(0, 1fr));
                gap: 1.5rem;
                flex-wrap: unset !important;
              }
              @media (min-width: 640px) {
                .avail-calendar .rdp-months {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
              @media (min-width: 1024px) {
                .avail-calendar .rdp-months {
                  grid-template-columns: repeat(3, minmax(0, 1fr));
                }
              }
              @media (min-width: 1280px) {
                .avail-calendar .rdp-months {
                  grid-template-columns: repeat(4, minmax(0, 1fr));
                }
              }
              .avail-calendar .rdp-month {
                overflow: hidden;
                min-width: 0;
              }
              .avail-calendar .rdp-month_grid {
                width: 100%;
                table-layout: fixed;
              }
              .avail-calendar .rdp-day_button {
                width: 100%;
                min-height: 2.75rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
              }
              .avail-calendar .rdp-day.rdp-blocked-day:not(.rdp-disabled) {
                background-color: rgb(254 226 226);
                border-radius: 6px;
              }
              .avail-calendar .rdp-day.rdp-booked-day:not(.rdp-disabled) {
                background-color: rgb(187 247 208);
                border-radius: 6px;
              }
              .avail-calendar .rdp-day.rdp-pending-day {
                opacity: 0.5;
                animation: pulse-pending 1.5s ease-in-out infinite;
              }
              @keyframes pulse-pending {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.2; }
              }
            `}</style>
            <div className="avail-calendar">
              {selectionMode === 'single' ? (
                <DayPicker
                  numberOfMonths={12}
                  startMonth={calendarStart}
                  endMonth={calendarEnd}
                  disabled={[{ before: today }, ...pendingDateObjects]}
                  modifiers={{
                    blocked: blockedCalendarDates,
                    booked: bookedDates,
                    pending: pendingDateObjects,
                  }}
                  modifiersClassNames={{
                    blocked: 'rdp-blocked-day',
                    booked: 'rdp-booked-day',
                    pending: 'rdp-pending-day',
                  }}
                  onDayClick={handleDayClick}
                  components={{ DayButton: AvailDayButton }}
                />
              ) : (
                <DayPicker
                  mode="range"
                  selected={rangeSelection}
                  onSelect={setRangeSelection}
                  numberOfMonths={12}
                  startMonth={calendarStart}
                  endMonth={calendarEnd}
                  disabled={[{ before: today }, ...pendingDateObjects]}
                  modifiers={{
                    blocked: blockedCalendarDates,
                    booked: bookedDates,
                    pending: pendingDateObjects,
                  }}
                  modifiersClassNames={{
                    blocked: 'rdp-blocked-day',
                    booked: 'rdp-booked-day',
                    pending: 'rdp-pending-day',
                  }}
                  components={{ DayButton: AvailDayButton }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Range action panel */}
        {selectionMode === 'range' && rangeSelection?.from && (
          <Card className="mb-6">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium text-gray-900">
                {rangeSelection.to ? (
                  <>
                    {format(rangeSelection.from, 'MMM d, yyyy')} — {format(rangeSelection.to, 'MMM d, yyyy')}{' '}
                    ({differenceInDays(rangeSelection.to, rangeSelection.from) + 1} days)
                  </>
                ) : (
                  <>{format(rangeSelection.from, 'MMM d, yyyy')} — select an end date</>
                )}
                <button
                  onClick={() => setRangeSelection(undefined)}
                  className="ml-3 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear selection
                </button>
              </p>
              <Button
                onClick={handleBlockRange}
                disabled={!rangeSelection.to || blockingRange}
              >
                {blockingRange ? 'Blocking...' : 'Block range'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Status message */}
        {lastAction && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mb-6">
            {lastAction}
          </p>
        )}

        {/* Blocked dates list */}
        {blockedDates && blockedDates.length > 0 ? (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Upcoming &amp; active blocked dates
                </h2>
                <div className="space-y-3">
                  {upcoming.map((b) => {
                    const status = blockStatus(b.startDate, b.endDate)
                    const start = parseLocalDate(b.startDate)
                    const end = parseLocalDate(b.endDate)
                    const days = differenceInDays(end, start) + 1
                    return (
                      <Card key={b.id}>
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-gray-900">
                                {format(start, 'MMM d, yyyy')} — {format(end, 'MMM d, yyyy')}
                              </p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status.classes}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {days} {days === 1 ? 'day' : 'days'}
                              {b.reason ? ` · ${b.reason}` : ''}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBlockedDate.mutate({ id: b.id })}
                            disabled={deleteBlockedDate.isPending}
                            className="shrink-0 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past</h2>
                <div className="space-y-3">
                  {past.map((b) => {
                    const status = blockStatus(b.startDate, b.endDate)
                    const start = parseLocalDate(b.startDate)
                    const end = parseLocalDate(b.endDate)
                    const days = differenceInDays(end, start) + 1
                    return (
                      <Card key={b.id}>
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-medium text-gray-900">
                                {format(start, 'MMM d, yyyy')} — {format(end, 'MMM d, yyyy')}
                              </p>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${status.classes}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {days} {days === 1 ? 'day' : 'days'}
                              {b.reason ? ` · ${b.reason}` : ''}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteBlockedDate.mutate({ id: b.id })}
                            disabled={deleteBlockedDate.isPending}
                            className="shrink-0 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base font-medium text-gray-700 mb-1">No blocked dates</p>
            <p className="text-sm">Click dates on the calendar above to block them.</p>
          </div>
        )}

        {/* Upcoming Bookings */}
        {bookings && bookings.filter(
          (b) => (b.status === 'CONFIRMED' || b.status === 'PENDING') && new Date(b.checkIn) > new Date()
        ).length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Upcoming Bookings
            </h2>
            <div className="space-y-3">
              {bookings
                .filter(
                  (b) =>
                    (b.status === 'CONFIRMED' || b.status === 'PENDING') &&
                    new Date(b.checkIn) > new Date()
                )
                .slice(0, 10)
                .map((booking) => (
                  <Card
                    key={booking.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                  >
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.guestName}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(booking.checkIn), 'MMM d')} —{' '}
                          {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
