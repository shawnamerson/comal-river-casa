'use client'

import { useMemo, useRef, useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft, Trash2, X } from 'lucide-react'

const RATE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
]

type SeasonalRate = {
  id: string
  name: string
  startDate: string
  endDate: string
  pricePerNight: number
  cleaningFee: number | null
  minNights: number | null
}

export default function RatesManagementPage() {
  // Default rates editing state
  const [editingDefaults, setEditingDefaults] = useState(false)
  const [defaultsForm, setDefaultsForm] = useState<{
    basePrice: number
    cleaningFee: number
    minNights: number
    maxNights: number
  } | null>(null)

  // Calendar / rate form state
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>()
  const [editingRate, setEditingRate] = useState<SeasonalRate | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    pricePerNight: number
    cleaningFee: number | null
    minNights: number | null
  }>({
    name: '',
    pricePerNight: 200,
    cleaningFee: null,
    minNights: null,
  })

  // Prevents onSelect from overwriting state when we intercept a day click
  const skipNextSelect = useRef(false)

  // Fetch data
  const { data: propertySettings, refetch: refetchSettings } =
    trpc.admin.getPropertySettings.useQuery()
  const { data: rates, refetch } = trpc.admin.getSeasonalRates.useQuery()

  // Mutations
  const updateSettings = trpc.admin.updatePropertySettings.useMutation({
    onSuccess: () => {
      refetchSettings()
      setEditingDefaults(false)
      setDefaultsForm(null)
    },
    onError: (error) => alert(`Error saving settings: ${error.message}`),
  })

  const createRate = trpc.admin.createSeasonalRate.useMutation({
    onSuccess: () => { refetch(); closePanel() },
    onError: (error) => alert(`Error creating rate: ${error.message}`),
  })

  const updateRate = trpc.admin.updateSeasonalRate.useMutation({
    onSuccess: () => { refetch(); closePanel() },
    onError: (error) => alert(`Error updating rate: ${error.message}`),
  })

  const deleteRate = trpc.admin.deleteSeasonalRate.useMutation({
    onSuccess: () => { refetch(); closePanel() },
    onError: (error) => alert(`Error deleting rate: ${error.message}`),
  })

  // Build DayPicker modifiers for each rate's date range
  const { rateModifiers, rateModifiersStyles } = useMemo(() => {
    const modifiers: Record<string, { from: Date; to: Date }> = {}
    const modifiersStyles: Record<string, React.CSSProperties> = {}
    if (rates) {
      rates.forEach((rate, index) => {
        const color = RATE_COLORS[index % RATE_COLORS.length]
        const key = `rate-${index}`
        modifiers[key] = {
          from: new Date(rate.startDate),
          to: new Date(rate.endDate),
        }
        modifiersStyles[key] = {
          backgroundColor: color,
          color: 'white',
          borderRadius: 0,
        }
      })
    }
    return { rateModifiers: modifiers, rateModifiersStyles: modifiersStyles }
  }, [rates])

  const closePanel = () => {
    setPendingRange(undefined)
    setEditingRate(null)
    setFormData({
      name: '',
      pricePerNight: propertySettings?.basePrice ?? 200,
      cleaningFee: null,
      minNights: null,
    })
  }

  // Called when a day is clicked on the calendar
  const handleDayClick = (day: Date) => {
    // If mid-range selection (from set, to not yet set), let DayPicker handle it
    if (pendingRange?.from && !pendingRange?.to) return

    // Check if the clicked day falls within any existing rate
    const clicked = rates?.find((rate) => {
      const start = new Date(rate.startDate)
      const end = new Date(rate.endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return day >= start && day <= end
    })

    if (clicked) {
      // Intercept — prevent onSelect from overwriting our state
      skipNextSelect.current = true
      setEditingRate(clicked)
      setPendingRange({
        from: new Date(clicked.startDate),
        to: new Date(clicked.endDate),
      })
      setFormData({
        name: clicked.name,
        pricePerNight: clicked.pricePerNight,
        cleaningFee: clicked.cleaningFee,
        minNights: clicked.minNights,
      })
    }
  }

  const handleRangeSelect = (range: DateRange | undefined) => {
    if (skipNextSelect.current) {
      skipNextSelect.current = false
      return
    }
    setPendingRange(range)
    // Starting a fresh selection clears any rate being edited
    if (range?.from && range?.to) {
      setEditingRate(null)
    }
  }

  const handleSave = () => {
    if (!pendingRange?.from || !pendingRange?.to) {
      alert('Please select a date range')
      return
    }
    const payload = {
      name: formData.name.trim() ||
        `${format(pendingRange.from, 'MMM d')} – ${format(pendingRange.to, 'MMM d, yyyy')}`,
      startDate: pendingRange.from.toISOString(),
      endDate: pendingRange.to.toISOString(),
      pricePerNight: formData.pricePerNight,
      cleaningFee: formData.cleaningFee ?? undefined,
      minNights: formData.minNights ?? undefined,
    }

    if (editingRate) {
      updateRate.mutate({ id: editingRate.id, ...payload })
    } else {
      createRate.mutate(payload)
    }
  }

  const handleDelete = () => {
    if (!editingRate) return
    if (confirm(`Delete "${editingRate.name}"?`)) {
      deleteRate.mutate({ id: editingRate.id })
    }
  }

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

  const panelVisible = !!pendingRange?.from || editingRate !== null
  const isSaving = createRate.isPending || updateRate.isPending

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
          <h1 className="text-4xl font-bold mb-2">Rates & Availability</h1>
          <p className="text-gray-600">
            Manage your pricing for different seasons and periods
          </p>
        </div>

        {/* Default Rates Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Default Rates</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  These rates apply when no seasonal rate is active
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

        {/* Calendar + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <p className="text-sm text-gray-500 mb-3">
              Drag across empty dates to add a seasonal rate. Click a colored period to edit it.
            </p>
            <DayPicker
              mode="range"
              numberOfMonths={12}
              selected={pendingRange}
              onSelect={handleRangeSelect}
              onDayClick={handleDayClick}
              modifiers={rateModifiers}
              modifiersStyles={rateModifiersStyles}
              className="border rounded-lg p-4 bg-white"
              classNames={{ nav: 'hidden' }}
              styles={{
                months: {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '1rem',
                },
              }}
            />
          </div>

          {/* Side panel — only visible when a range or rate is selected */}
          {panelVisible && (
            <div className="lg:sticky lg:top-4 lg:self-start">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      {editingRate ? 'Edit Rate' : 'New Rate'}
                    </CardTitle>
                    <button
                      onClick={closePanel}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  {pendingRange?.from && pendingRange?.to && (
                    <p className="text-sm text-gray-500 mt-1">
                      {format(pendingRange.from, 'MMM d, yyyy')} &ndash;{' '}
                      {format(pendingRange.to, 'MMM d, yyyy')}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rate Name */}
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Rate Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Summer Peak"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Price / night */}
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Price / night</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={formData.pricePerNight || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, pricePerNight: parseFloat(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>

                  {/* Cleaning fee */}
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Cleaning fee <span className="font-normal text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Default: $${propertySettings?.cleaningFee ?? 75}`}
                        value={formData.cleaningFee ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cleaningFee: e.target.value ? parseFloat(e.target.value) : null,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Min nights */}
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Min nights <span className="font-normal text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Default: ${propertySettings?.minNights ?? 2}`}
                      value={formData.minNights ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minNights: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !pendingRange?.from || !pendingRange?.to}
                      className="flex-1"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    {editingRate && (
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        onClick={handleDelete}
                        disabled={deleteRate.isPending}
                        aria-label="Delete rate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Compact rate list */}
        {rates && rates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {rates.map((rate, index) => (
                  <div
                    key={rate.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: RATE_COLORS[index % RATE_COLORS.length] }}
                    />
                    <span className="font-medium flex-1 min-w-0 truncate">{rate.name}</span>
                    <span className="text-sm text-gray-500 flex-shrink-0">
                      {format(new Date(rate.startDate), 'MMM d')} &ndash;{' '}
                      {format(new Date(rate.endDate), 'MMM d, yyyy')}
                    </span>
                    <span className="text-sm font-semibold text-green-600 flex-shrink-0">
                      ${rate.pricePerNight}/night
                    </span>
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      onClick={() => {
                        if (confirm(`Delete "${rate.name}"?`)) {
                          deleteRate.mutate({ id: rate.id })
                        }
                      }}
                      disabled={deleteRate.isPending}
                      aria-label={`Delete ${rate.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
