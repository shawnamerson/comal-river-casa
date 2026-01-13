'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'

export default function ExternalCalendarsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    platform: 'AIRBNB' as 'AIRBNB' | 'VRBO' | 'BOOKING_COM' | 'OTHER',
    icalUrl: '',
  })

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">External Calendar Sync</h1>
          <p className="text-gray-600 mt-2">
            Import bookings from Airbnb, Vrbo, and other platforms
          </p>
        </div>
        <div className="flex gap-2">
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

      {/* How to Get iCal URLs */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">How to Get Your iCal URL</CardTitle>
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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

                  <div className="flex gap-2 ml-4">
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
