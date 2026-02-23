'use client'

import { useState, useMemo, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import type { DateRange } from 'react-day-picker'
import { format, startOfMonth, addMonths, startOfToday, eachDayOfInterval } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const inputClass = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

type Mode = 'price' | 'minNights'

export default function RatesManagementPage() {
  // Default rates editing state
  const [editingDefaults, setEditingDefaults] = useState(false)
  const [defaultsForm, setDefaultsForm] = useState<{
    basePrice: number
    cleaningFee: number
    minNights: number
    maxNights: number
  } | null>(null)

  // Calendar state
  const [mode, setMode] = useState<Mode>('price')
  const [selectMode, setSelectMode] = useState<'single' | 'range'>('single')
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [rangeSelection, setRangeSelection] = useState<DateRange | undefined>()
  const [pricePerNight, setPricePerNight] = useState<number>(0)
  const [minNights, setMinNights] = useState<string>('')
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [calendarKey, setCalendarKey] = useState(0)

  // Auto-clear success message
  useEffect(() => {
    if (!lastAction) return
    const t = setTimeout(() => setLastAction(null), 4000)
    return () => clearTimeout(t)
  }, [lastAction])

  function resetSelection() {
    setSelectedDates([])
    setRangeSelection(undefined)
    setCalendarKey((k) => k + 1)
  }

  function handleSelectModeChange(newMode: 'single' | 'range') {
    setSelectMode(newMode)
    setSelectedDates([])
    setRangeSelection(undefined)
    setCalendarKey((k) => k + 1)
  }

  // Fetch data
  const { data: propertySettings, refetch: refetchSettings } =
    trpc.admin.getPropertySettings.useQuery()
  const { data: overrides, refetch } = trpc.admin.getDateRateOverrides.useQuery()

  // Mutations — default rates
  const updateSettings = trpc.admin.updatePropertySettings.useMutation({
    onSuccess: () => {
      refetchSettings()
      setEditingDefaults(false)
      setDefaultsForm(null)
    },
    onError: (error) => alert(`Error saving settings: ${error.message}`),
  })

  // Mutations — date rate overrides
  const setPriceMut = trpc.admin.setDateRatePrice.useMutation()
  const clearPriceMut = trpc.admin.clearDateRatePrice.useMutation()
  const setMinNightsMut = trpc.admin.setDateRateMinNights.useMutation()
  const clearMinNightsMut = trpc.admin.clearDateRateMinNights.useMutation()

  // Override lookup map
  const overrideMap = useMemo(() => {
    const map = new Map<string, { pricePerNight: number | null; minNights: number | null }>()
    overrides?.forEach((o) => map.set(o.date, o))
    return map
  }, [overrides])

  // Dates that have overrides (for DayPicker modifiers)
  const overrideDates = useMemo(
    () =>
      overrides
        ?.filter((o) => (mode === 'price' ? o.pricePerNight != null : o.minNights != null))
        .map((o) => new Date(o.date + 'T00:00:00')) ?? [],
    [overrides, mode]
  )

  const today = startOfToday()
  const calendarStart = startOfMonth(today)
  const calendarEnd = addMonths(calendarStart, 11)

  // Unified effective dates from both selection modes
  const effectiveDates = useMemo(() => {
    if (selectMode === 'single') return selectedDates
    if (!rangeSelection?.from || !rangeSelection?.to) return []
    return eachDayOfInterval({ start: rangeSelection.from, end: rangeSelection.to })
  }, [selectMode, selectedDates, rangeSelection])

  const effectiveDateStrs = useMemo(
    () => effectiveDates.map((d) => format(d, 'yyyy-MM-dd')),
    [effectiveDates]
  )

  const selectedHavePriceOverrides = effectiveDates.some((d) => {
    const o = overrideMap.get(format(d, 'yyyy-MM-dd'))
    return o?.pricePerNight != null
  })

  const selectedHaveMinNightsOverrides = effectiveDates.some((d) => {
    const o = overrideMap.get(format(d, 'yyyy-MM-dd'))
    return o?.minNights != null
  })

  // Pre-fill input when all selected dates share the same override value
  useEffect(() => {
    if (effectiveDates.length === 0) return
    const prices = effectiveDates.map((d) => overrideMap.get(format(d, 'yyyy-MM-dd'))?.pricePerNight ?? null)
    const uniquePrices = [...new Set(prices)]
    if (uniquePrices.length === 1 && uniquePrices[0] != null) {
      setPricePerNight(uniquePrices[0])
    }
    const mins = effectiveDates.map((d) => overrideMap.get(format(d, 'yyyy-MM-dd'))?.minNights ?? null)
    const uniqueMins = [...new Set(mins)]
    if (uniqueMins.length === 1 && uniqueMins[0] != null) {
      setMinNights(String(uniqueMins[0]))
    }
  }, [effectiveDates, overrideMap])

  // Action handlers
  async function handleApplyPrice() {
    if (effectiveDates.length === 0 || pricePerNight <= 0) return
    const count = effectiveDates.length
    const price = pricePerNight
    try {
      await setPriceMut.mutateAsync({ dates: effectiveDateStrs, pricePerNight })
      await refetch()
      resetSelection()
      setPricePerNight(0)
      setLastAction(`$${price}/night applied to ${count} date${count !== 1 ? 's' : ''}`)
    } catch (e: any) {
      setLastAction(e?.message ?? 'Failed to apply rate')
    }
  }

  async function handleClearPrice() {
    if (effectiveDates.length === 0) return
    const count = effectiveDates.length
    try {
      await clearPriceMut.mutateAsync({ dates: effectiveDateStrs })
      await refetch()
      resetSelection()
      setLastAction(`Rate cleared for ${count} date${count !== 1 ? 's' : ''}`)
    } catch (e: any) {
      setLastAction(e?.message ?? 'Failed to clear rate')
    }
  }

  async function handleApplyMinNights() {
    if (effectiveDates.length === 0 || !minNights || Number(minNights) < 1) return
    const count = effectiveDates.length
    const mn = Number(minNights)
    try {
      await setMinNightsMut.mutateAsync({ dates: effectiveDateStrs, minNights: mn })
      await refetch()
      resetSelection()
      setMinNights('')
      setLastAction(`${mn}-night minimum applied to ${count} date${count !== 1 ? 's' : ''}`)
    } catch (e: any) {
      setLastAction(e?.message ?? 'Failed to apply min nights')
    }
  }

  async function handleClearMinNights() {
    if (effectiveDates.length === 0) return
    const count = effectiveDates.length
    try {
      await clearMinNightsMut.mutateAsync({ dates: effectiveDateStrs })
      await refetch()
      resetSelection()
      setLastAction(`Min nights cleared for ${count} date${count !== 1 ? 's' : ''}`)
    } catch (e: any) {
      setLastAction(e?.message ?? 'Failed to clear min nights')
    }
  }

  // Default rates handlers
  const handleEditDefaults = () => {
    if (propertySettings) {
      setDefaultsForm({
        basePrice: propertySettings.basePrice,
        cleaningFee: propertySettings.cleaningFee,
        minNights: propertySettings.minNights,
        maxNights: propertySettings.maxNights,
      })
    }
    setEditingDefaults(true)
  }

  const handleSaveDefaults = () => {
    if (!defaultsForm) return
    updateSettings.mutate(defaultsForm)
  }

  const handleCancelDefaults = () => {
    setEditingDefaults(false)
    setDefaultsForm(null)
  }

  // DayButton component for rendering price/minNights labels
  const DayButton = ({ day, modifiers, children, ...props }: any) => {
    const dateStr = format(day.date, 'yyyy-MM-dd')
    const override = overrideMap.get(dateStr)
    const isDisabled = modifiers?.disabled

    let label: string | null = null
    let isOverridden = false

    if (!isDisabled) {
      if (mode === 'price') {
        if (override?.pricePerNight != null) {
          label = `$${override.pricePerNight}`
          isOverridden = true
        } else if (propertySettings?.basePrice != null) {
          label = `$${propertySettings.basePrice}`
        }
      } else {
        if (override?.minNights != null) {
          label = `${override.minNights}n`
          isOverridden = true
        } else if (propertySettings?.minNights != null) {
          label = `${propertySettings.minNights}n`
        }
      }
    }

    return (
      <button {...props}>
        {children}
        {label && (
          <span
            className={`block text-[9px] leading-tight font-medium ${
              isOverridden ? 'text-blue-700' : 'text-gray-400'
            }`}
          >
            {label}
          </span>
        )}
      </button>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Rates & Pricing</h1>
          <p className="text-gray-600">
            Manage your base rates and per-date price overrides
          </p>
        </div>

        {/* Default Rates Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Default Rates</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  These rates apply when no date override is set
                </p>
              </div>
              {!editingDefaults && (
                <Button size="sm" variant="outline" onClick={handleEditDefaults}>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingDefaults && defaultsForm ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <label className="text-sm text-gray-600 mb-1 block">Base Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={defaultsForm.basePrice}
                        onChange={(e) =>
                          setDefaultsForm({ ...defaultsForm, basePrice: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">per night</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <label className="text-sm text-gray-600 mb-1 block">Cleaning Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={defaultsForm.cleaningFee}
                        onChange={(e) =>
                          setDefaultsForm({ ...defaultsForm, cleaningFee: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">per booking</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <label className="text-sm text-gray-600 mb-1 block">Min Nights</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={defaultsForm.minNights}
                      onChange={(e) =>
                        setDefaultsForm({ ...defaultsForm, minNights: parseInt(e.target.value) || 1 })
                      }
                    />
                    <div className="text-xs text-gray-500 mt-1">minimum stay</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <label className="text-sm text-gray-600 mb-1 block">Max Nights</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={defaultsForm.maxNights}
                      onChange={(e) =>
                        setDefaultsForm({ ...defaultsForm, maxNights: parseInt(e.target.value) || 1 })
                      }
                    />
                    <div className="text-xs text-gray-500 mt-1">maximum stay</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveDefaults} disabled={updateSettings.isPending}>
                    {updateSettings.isPending ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelDefaults}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Base Price</div>
                  <div className="text-2xl font-bold">
                    ${propertySettings?.basePrice ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500">per night</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Cleaning Fee</div>
                  <div className="text-2xl font-bold">
                    ${propertySettings?.cleaningFee ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500">per booking</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Min Nights</div>
                  <div className="text-2xl font-bold">
                    {propertySettings?.minNights ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500">minimum stay</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Max Nights</div>
                  <div className="text-2xl font-bold">
                    {propertySettings?.maxNights ?? '—'}
                  </div>
                  <div className="text-xs text-gray-500">maximum stay</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rate Calendar */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Rate Calendar</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {selectMode === 'single'
                    ? `Click dates to select them, then ${mode === 'price' ? 'set a custom rate' : 'set minimum nights'} below.`
                    : `Click a start date, then an end date to select a range, then ${mode === 'price' ? 'set a custom rate' : 'set minimum nights'} below.`}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {/* Mode toggle */}
                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                  <button
                    onClick={() => setMode('price')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      mode === 'price'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Nightly price
                  </button>
                  <button
                    onClick={() => setMode('minNights')}
                    className={`px-4 py-2 font-medium transition-colors border-l border-gray-300 ${
                      mode === 'minNights'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Minimum nights
                  </button>
                </div>
                {/* Select mode toggle */}
                <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-sm">
                  <button
                    onClick={() => handleSelectModeChange('single')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      selectMode === 'single'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Single dates
                  </button>
                  <button
                    onClick={() => handleSelectModeChange('range')}
                    className={`px-4 py-2 font-medium transition-colors border-l border-gray-300 ${
                      selectMode === 'range'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Date range
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <style>{`
              .rate-calendar {
                overflow: hidden;
              }
              .rate-calendar .rdp-root {
                --rdp-cell-size: 2.25rem;
                width: 100%;
              }
              .rate-calendar .rdp-months {
                display: grid !important;
                grid-template-columns: repeat(1, minmax(0, 1fr));
                gap: 1.5rem;
                flex-wrap: unset !important;
              }
              @media (min-width: 640px) {
                .rate-calendar .rdp-months {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                }
              }
              @media (min-width: 1024px) {
                .rate-calendar .rdp-months {
                  grid-template-columns: repeat(3, minmax(0, 1fr));
                }
              }
              @media (min-width: 1280px) {
                .rate-calendar .rdp-months {
                  grid-template-columns: repeat(4, minmax(0, 1fr));
                }
              }
              .rate-calendar .rdp-month {
                overflow: hidden;
                min-width: 0;
              }
              .rate-calendar .rdp-month_grid {
                width: 100%;
                table-layout: fixed;
              }
              .rate-calendar .rdp-day_button {
                width: 100%;
                min-height: 2.75rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
              }
              .rate-calendar .rdp-day.rdp-override-day:not(.rdp-disabled) {
                background-color: rgb(219 234 254);
                border-radius: 6px;
              }
            `}</style>
            <div className="rate-calendar">
              {selectMode === 'single' ? (
                <DayPicker
                  key={calendarKey}
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates ?? [])}
                  numberOfMonths={12}
                  startMonth={calendarStart}
                  endMonth={calendarEnd}
                  disabled={{ before: today }}
                  modifiers={{ override: overrideDates }}
                  modifiersClassNames={{ override: 'rdp-override-day' }}
                  components={{ DayButton }}
                />
              ) : (
                <DayPicker
                  key={calendarKey}
                  mode="range"
                  selected={rangeSelection}
                  onSelect={setRangeSelection}
                  numberOfMonths={12}
                  startMonth={calendarStart}
                  endMonth={calendarEnd}
                  disabled={{ before: today }}
                  modifiers={{ override: overrideDates }}
                  modifiersClassNames={{ override: 'rdp-override-day' }}
                  components={{ DayButton }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action panel */}
        {effectiveDates.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-medium text-gray-900">
                {selectMode === 'range' && rangeSelection?.from && rangeSelection?.to ? (
                  <>
                    {format(rangeSelection.from, 'MMM d, yyyy')} — {format(rangeSelection.to, 'MMM d, yyyy')}{' '}
                    ({effectiveDates.length} date{effectiveDates.length !== 1 ? 's' : ''})
                  </>
                ) : (
                  <>{effectiveDates.length} date{effectiveDates.length !== 1 ? 's' : ''} selected</>
                )}
                <button
                  onClick={resetSelection}
                  className="ml-3 text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  {selectMode === 'range' ? 'Clear selection' : 'Deselect all'}
                </button>
              </p>

              {mode === 'price' ? (
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Price per night ($)
                    </label>
                    <input
                      type="number"
                      value={pricePerNight || ''}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      min={1}
                      className={inputClass}
                      placeholder={`Base: $${propertySettings?.basePrice ?? ''}`}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={handleApplyPrice}
                      disabled={pricePerNight <= 0 || setPriceMut.isPending}
                    >
                      {setPriceMut.isPending ? 'Saving...' : 'Apply rate'}
                    </Button>
                    {selectedHavePriceOverrides && (
                      <Button
                        variant="outline"
                        onClick={handleClearPrice}
                        disabled={clearPriceMut.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {clearPriceMut.isPending ? 'Clearing...' : 'Clear rate'}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1">
                      Minimum nights
                    </label>
                    <input
                      type="number"
                      value={minNights}
                      onChange={(e) => setMinNights(e.target.value)}
                      min={1}
                      className={inputClass}
                      placeholder={`Base: ${propertySettings?.minNights ?? ''}`}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={handleApplyMinNights}
                      disabled={!minNights || Number(minNights) < 1 || setMinNightsMut.isPending}
                    >
                      {setMinNightsMut.isPending ? 'Saving...' : 'Apply min nights'}
                    </Button>
                    {selectedHaveMinNightsOverrides && (
                      <Button
                        variant="outline"
                        onClick={handleClearMinNights}
                        disabled={clearMinNightsMut.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        {clearMinNightsMut.isPending ? 'Clearing...' : 'Clear min nights'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {lastAction && (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 mt-3">
            {lastAction}
          </p>
        )}

        {/* Empty state */}
        {overrides && overrides.length === 0 && effectiveDates.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base font-medium text-gray-700 mb-1">No custom rate overrides</p>
            <p className="text-sm">
              All bookings use your base rate of ${propertySettings?.basePrice ?? '—'}/night. Click dates on the calendar to set custom rates.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
