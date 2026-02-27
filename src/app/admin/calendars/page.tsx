'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ExternalCalendarsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [exportUrlCopied, setExportUrlCopied] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    platform: 'AIRBNB' as 'AIRBNB' | 'VRBO' | 'BOOKING_COM' | 'OTHER',
    icalUrl: '',
  })

  const getExportUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/api/calendar/export?token=${process.env.NEXT_PUBLIC_CALENDAR_EXPORT_TOKEN}`
    }
    return ''
  }

  const handleCopyExportUrl = async () => {
    const url = getExportUrl()
    await navigator.clipboard.writeText(url)
    setExportUrlCopied(true)
    setTimeout(() => setExportUrlCopied(false), 2000)
  }

  const { data: calendars, refetch } = trpc.externalCalendar.list.useQuery()

  const createCalendar = trpc.externalCalendar.create.useMutation({
    onSuccess: () => {
      setShowAddForm(false)
      setFormData({ name: '', platform: 'AIRBNB', icalUrl: '' })
      refetch()
      alert('Calendar added successfully!')
    },
    onError: (error) => {
      alert(`Error: ${error.message}`)
    },
  })

  const deleteCalendar = trpc.externalCalendar.delete.useMutation({
    onSuccess: () => {
      refetch()
      alert('Calendar deleted successfully!')
    },
    onError: (error) => {
      alert(`Error: ${error.message}`)
    },
  })

  const syncCalendar = trpc.externalCalendar.sync.useMutation({
    onSuccess: (data) => {
      refetch()
      alert(`Sync successful! ${data.syncedEvents} events imported.`)
    },
    onError: (error) => {
      alert(`Sync failed: ${error.message}`)
    },
  })

  const syncAll = trpc.externalCalendar.syncAll.useMutation({
    onSuccess: (results) => {
      refetch()
      const successCount = results.filter((r) => r.success).length
      const failCount = results.filter((r) => !r.success).length
      const totalEvents = results
        .filter((r) => r.success)
        .reduce((sum, r) => sum + ('syncedEvents' in r ? r.syncedEvents : 0), 0)
      alert(
        `Sync complete!\nSuccessful: ${successCount}\nFailed: ${failCount}\n\nTotal events: ${totalEvents}`
      )
    },
    onError: (error) => {
      alert(`Error: ${error.message}`)
    },
  })

  const toggleActive = trpc.externalCalendar.update.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createCalendar.mutate(formData)
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? All synced dates will be removed.`)) {
      deleteCalendar.mutate({ id })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">External Calendar Sync</h1>
          <p className="text-gray-600 mt-2">
            Import bookings from Airbnb, Vrbo, and other platforms
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            onClick={() => syncAll.mutate()}
            variant="outline"
            disabled={syncAll.isPending || !calendars || calendars.length === 0}
          >
            {syncAll.isPending ? 'Syncing...' : 'Sync All'}
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            Add Calendar
          </Button>
        </div>
      </div>

      {/* Export Your Bookings */}
      <Card className="mb-6 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg">Export Your Bookings & Blocked Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            Share this iCal URL with Airbnb, VRBO, and other platforms to automatically block dates when guests book directly on your site or when you manually block dates.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={getExportUrl()}
              className="flex-1 px-4 py-2 border rounded-lg bg-white text-sm font-mono min-w-0"
            />
            <Button onClick={handleCopyExportUrl} variant="outline" className="flex-shrink-0">
              {exportUrlCopied ? 'Copied!' : 'Copy URL'}
            </Button>
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Airbnb:</strong> Calendar → Availability settings → Import calendar → Paste URL</p>
            <p><strong>VRBO:</strong> Calendar → Import/Export → Import calendar → Paste URL</p>
          </div>
        </CardContent>
      </Card>

      {/* How to Get iCal URLs */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">How to Get Your iCal URL (for importing)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold">Airbnb:</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Go to Calendar on Airbnb.com</li>
              <li>Click &ldquo;Availability settings&rdquo;</li>
              <li>Scroll to &ldquo;Calendar sync&rdquo;</li>
              <li>Click &ldquo;Export calendar&rdquo;</li>
              <li>Copy the iCal link</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold">Vrbo:</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Go to your property calendar</li>
              <li>Click on &ldquo;Availability settings&rdquo;</li>
              <li>Find &ldquo;Calendar export&rdquo;</li>
              <li>Copy the iCal URL</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Add Calendar Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add External Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Calendar Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Airbnb Main Listing"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Platform *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      platform: e.target.value as typeof formData.platform,
                    })
                  }
                >
                  <option value="AIRBNB">Airbnb</option>
                  <option value="VRBO">Vrbo</option>
                  <option value="BOOKING_COM">Booking.com</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  iCal URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.airbnb.com/calendar/ical/..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.icalUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, icalUrl: e.target.value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the iCal export URL from your platform
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createCalendar.isPending}>
                  {createCalendar.isPending ? 'Adding...' : 'Add Calendar'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Calendar List */}
      <div className="space-y-4">
        {calendars && calendars.length > 0 ? (
          calendars.map((calendar) => (
            <Card key={calendar.id}>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{calendar.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          calendar.platform === 'AIRBNB'
                            ? 'bg-pink-100 text-pink-800'
                            : calendar.platform === 'VRBO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {calendar.platform}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          calendar.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {calendar.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 break-all">
                      {calendar.icalUrl}
                    </p>

                    {calendar.lastSyncAt && (
                      <div className="text-sm">
                        <span className="text-gray-600">Last sync: </span>
                        <span className="font-medium">
                          {format(new Date(calendar.lastSyncAt), 'MMM dd, yyyy h:mm a')}
                        </span>
                        {calendar.lastSyncStatus === 'SUCCESS' && (
                          <span className="ml-2 text-green-600">✓ Success</span>
                        )}
                        {calendar.lastSyncStatus === 'FAILED' && (
                          <span className="ml-2 text-red-600">✗ Failed</span>
                        )}
                      </div>
                    )}

                    {calendar.lastSyncError && (
                      <p className="text-xs text-red-600 mt-1">
                        Error: {calendar.lastSyncError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncCalendar.mutate({ id: calendar.id })}
                      disabled={syncCalendar.isPending}
                    >
                      {syncCalendar.isPending ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleActive.mutate({
                          id: calendar.id,
                          isActive: !calendar.isActive,
                        })
                      }
                    >
                      {calendar.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(calendar.id, calendar.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">No external calendars configured</p>
              <Button onClick={() => setShowAddForm(true)}>
                Add Your First Calendar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
