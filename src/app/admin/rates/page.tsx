'use client'

import { useState } from 'react'
import { DayPicker, DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RatesManagementPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingRate, setEditingRate] = useState<string | null>(null)

  // Default rates editing state
  const [editingDefaults, setEditingDefaults] = useState(false)
  const [defaultsForm, setDefaultsForm] = useState<{
    basePrice: number
    cleaningFee: number
    minNights: number
    maxNights: number
  } | null>(null)

  // Fetch default property settings
  const { data: propertySettings, refetch: refetchSettings } =
    trpc.admin.getPropertySettings.useQuery()

  // Update property settings mutation
  const updateSettings = trpc.admin.updatePropertySettings.useMutation({
    onSuccess: () => {
      refetchSettings()
      setEditingDefaults(false)
      setDefaultsForm(null)
    },
    onError: (error) => {
      alert(`Error saving settings: ${error.message}`)
    },
  })

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

  // Form state
  const [formData, setFormData] = useState<{
    name: string
    pricePerNight: number
    cleaningFee: number
    minNights: number
  }>({
    name: '',
    pricePerNight: 200,
    cleaningFee: 75,
    minNights: 2,
  })
  const [range, setRange] = useState<DateRange | undefined>()

  // Fetch seasonal rates
  const { data: rates, refetch } = trpc.admin.getSeasonalRates.useQuery()

  // Mutations
  const createRate = trpc.admin.createSeasonalRate.useMutation({
    onSuccess: () => {
      refetch()
      resetForm()
      alert('Seasonal rate created successfully!')
    },
    onError: (error) => {
      alert(`Error creating rate: ${error.message}`)
    },
  })

  const deleteRate = trpc.admin.deleteSeasonalRate.useMutation({
    onSuccess: () => {
      refetch()
      alert('Seasonal rate deleted successfully!')
    },
    onError: (error) => {
      alert(`Error deleting rate: ${error.message}`)
    },
  })

  const resetForm = () => {
    setShowForm(false)
    setEditingRate(null)
    setFormData({
      name: '',
      pricePerNight: propertySettings?.basePrice ?? 200,
      cleaningFee: propertySettings?.cleaningFee ?? 75,
      minNights: propertySettings?.minNights ?? 2,
    })
    setRange(undefined)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!range?.from || !range?.to) {
      alert('Please select a date range')
      return
    }

    createRate.mutate({
      name: formData.name,
      startDate: range.from.toISOString(),
      endDate: range.to.toISOString(),
      pricePerNight: formData.pricePerNight,
      cleaningFee: formData.cleaningFee || undefined,
      minNights: formData.minNights || undefined,
    })
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
                  <Button
                    onClick={handleSaveDefaults}
                    disabled={updateSettings.isPending}
                  >
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

        {/* Seasonal Rates Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Existing Rates List */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Seasonal Rates</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => setShowForm(!showForm)}
                  >
                    {showForm ? 'Cancel' : '+ Add New Rate'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!rates || rates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No seasonal rates configured</p>
                    <p className="text-sm">
                      Add seasonal rates to override default pricing for specific periods
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rates.map((rate) => (
                      <div
                        key={rate.id}
                        className="border rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{rate.name}</h3>
                            <p className="text-sm text-gray-600">
                              {format(new Date(rate.startDate), 'MMM dd, yyyy')} -{' '}
                              {format(new Date(rate.endDate), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Nightly Rate:</span>
                            <div className="font-semibold text-green-600">
                              ${rate.pricePerNight}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Cleaning Fee:</span>
                            <div className="font-semibold">
                              {rate.cleaningFee ? `$${rate.cleaningFee}` : 'Default'}
                            </div>
                          </div>
                          {rate.minNights && (
                            <div>
                              <span className="text-gray-600">Min Nights:</span>
                              <div className="font-semibold">{rate.minNights}</div>
                            </div>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            if (confirm('Delete this seasonal rate?')) {
                              deleteRate.mutate({ id: rate.id })
                            }
                          }}
                          disabled={deleteRate.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingRate ? 'Edit Seasonal Rate' : 'Add New Seasonal Rate'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rate Name */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Rate Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Summer Peak, Holiday Season"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Date Range Picker */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Date Range *
                      </label>
                      <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={setRange}
                        disabled={{ before: new Date() }}
                        numberOfMonths={2}
                        className="border rounded-lg p-3"
                      />
                      {range?.from && range?.to && (
                        <div className="mt-2 text-sm text-gray-600">
                          {format(range.from, 'MMM dd, yyyy')} -{' '}
                          {format(range.to, 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>

                    {/* Price Per Night */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Price Per Night *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          required
                          min="0"
                          step="1"
                          className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={formData.pricePerNight}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricePerNight: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    {/* Cleaning Fee */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Cleaning Fee (Optional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={`Default: $${propertySettings?.cleaningFee ?? 75}`}
                          value={formData.cleaningFee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cleaningFee: e.target.value ? parseFloat(e.target.value) : (propertySettings?.cleaningFee ?? 75),
                            })
                          }
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use default cleaning fee
                      </p>
                    </div>

                    {/* Min Nights */}
                    <div>
                      <label className="text-sm font-semibold mb-2 block">
                        Minimum Nights (Optional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Default: ${propertySettings?.minNights ?? 2}`}
                        value={formData.minNights}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minNights: e.target.value ? parseInt(e.target.value) : (propertySettings?.minNights ?? 2),
                          })
                        }
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Override minimum nights requirement for this period
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={
                          !range?.from || !range?.to || createRate.isPending
                        }
                      >
                        {createRate.isPending
                          ? 'Saving...'
                          : editingRate
                          ? 'Update Rate'
                          : 'Create Rate'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
