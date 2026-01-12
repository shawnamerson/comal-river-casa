'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

export default function AdminDashboard() {
  const router = useRouter()

  // Fetch data
  const { data: stats } = trpc.admin.getStats.useQuery()
  const { data: bookings, refetch: refetchBookings } = trpc.admin.getAllBookings.useQuery()
  const { data: blockedDates, refetch: refetchBlockedDates } = trpc.admin.getBlockedDates.useQuery()

  // Mutations
  const updateStatus = trpc.admin.updateBookingStatus.useMutation({
    onSuccess: () => {
      refetchBookings()
      alert('Booking status updated successfully')
    },
    onError: (error) => {
      alert(`Error updating status: ${error.message}`)
    },
  })

  const deleteBlockedDate = trpc.admin.deleteBlockedDate.useMutation({
    onSuccess: () => {
      refetchBlockedDates()
      alert('Blocked date removed successfully')
    },
    onError: (error) => {
      alert(`Error removing blocked date: ${error.message}`)
    },
  })

  const handleCancelBooking = (bookingId: string) => {
    const reason = prompt('Enter cancellation reason:')
    if (reason !== null) {
      updateStatus.mutate({
        id: bookingId,
        status: 'CANCELLED',
        cancellationReason: reason || undefined,
      })
    }
  }

  const handleConfirmBooking = (bookingId: string) => {
    if (confirm('Confirm this booking?')) {
      updateStatus.mutate({
        id: bookingId,
        status: 'CONFIRMED',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">Manage bookings and property availability</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/admin/availability')}>
              📅 Manage Availability
            </Button>
            <Button onClick={() => router.push('/admin/rates')} variant="outline">
              💰 Manage Rates
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBookings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.upcomingBookings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Current
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.currentBookings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.pendingBookings}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${stats.totalRevenue}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {!bookings || bookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No bookings yet</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/bookings/${booking.id}`)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.guestName}</h3>
                            <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                            {booking.guestPhone && (
                              <p className="text-sm text-gray-600">{booking.guestPhone}</p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 my-3 text-sm">
                          <div>
                            <span className="text-gray-600">Check-in:</span>
                            <div className="font-semibold">
                              {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Check-out:</span>
                            <div className="font-semibold">
                              {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Guests:</span>
                            <div className="font-semibold">{booking.numberOfGuests}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Nights:</span>
                            <div className="font-semibold">{booking.numberOfNights}</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t">
                          <div className="text-lg font-bold text-green-600">
                            ${booking.totalPrice}
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {booking.status === 'PENDING' && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmBooking(booking.id)}
                                disabled={updateStatus.isPending}
                              >
                                Confirm
                              </Button>
                            )}
                            {(booking.status === 'PENDING' ||
                              booking.status === 'CONFIRMED') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={updateStatus.isPending}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-600">Special Requests:</p>
                            <p className="text-sm">{booking.specialRequests}</p>
                          </div>
                        )}

                        {booking.status === 'CANCELLED' && booking.cancellationReason && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-red-600">
                              Cancelled: {booking.cancellationReason}
                            </p>
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500">
                          Booking ID: {booking.id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Blocked Dates Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Blocked Dates</CardTitle>
              </CardHeader>
              <CardContent>
                {!blockedDates || blockedDates.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No blocked dates
                  </p>
                ) : (
                  <div className="space-y-3">
                    {blockedDates.map((blocked) => (
                      <div
                        key={blocked.id}
                        className="border rounded-lg p-3 bg-red-50"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-sm">
                            <div className="font-semibold">
                              {format(new Date(blocked.startDate), 'MMM dd')} -{' '}
                              {format(new Date(blocked.endDate), 'MMM dd, yyyy')}
                            </div>
                            {blocked.reason && (
                              <div className="text-gray-600 mt-1">{blocked.reason}</div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
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

                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    window.location.href = '/admin/block-dates'
                  }}
                >
                  Block New Dates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
