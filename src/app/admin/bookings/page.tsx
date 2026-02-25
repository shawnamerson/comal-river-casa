'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

export default function AdminBookingsPage() {
  const router = useRouter()

  const { data: bookings, refetch: refetchBookings } = trpc.admin.getAllBookings.useQuery()

  const updateStatus = trpc.admin.updateBookingStatus.useMutation({
    onSuccess: () => {
      refetchBookings()
      alert('Booking status updated successfully')
    },
    onError: (error) => {
      alert(`Error updating status: ${error.message}`)
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
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold">All Bookings</h1>
        </div>

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
    </main>
  )
}
