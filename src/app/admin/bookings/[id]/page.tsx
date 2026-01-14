'use client'

import { useParams } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BookingDetailPage() {
  const params = useParams()
  const bookingId = params.id as string

  // Fetch booking details
  const { data: booking, refetch } = trpc.admin.getBooking.useQuery(
    { id: bookingId },
    { enabled: !!bookingId }
  )

  // Mutations
  const updateStatus = trpc.admin.updateBookingStatus.useMutation({
    onSuccess: () => {
      refetch()
      alert('Booking status updated successfully')
    },
    onError: (error) => {
      alert(`Error updating status: ${error.message}`)
    },
  })

  const handleCancelBooking = () => {
    const reason = prompt('Enter cancellation reason:')
    if (reason !== null) {
      updateStatus.mutate({
        id: bookingId,
        status: 'CANCELLED',
        cancellationReason: `Cancelled by owner${reason ? `: ${reason}` : ''}`,
      })
    }
  }

  const handleConfirmBooking = () => {
    if (confirm('Confirm this booking?')) {
      updateStatus.mutate({
        id: bookingId,
        status: 'CONFIRMED',
      })
    }
  }

  const handleCompleteBooking = () => {
    if (confirm('Mark this booking as completed?')) {
      updateStatus.mutate({
        id: bookingId,
        status: 'COMPLETED',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'text-green-600'
      case 'PENDING':
        return 'text-yellow-600'
      case 'FAILED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!booking) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading booking...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin
          </Link>
          <div
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status}
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Booking Details</h1>
          <p className="text-gray-600">Booking ID: {booking.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Full Name</div>
                    <div className="font-semibold text-lg">{booking.guestName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Number of Guests</div>
                    <div className="font-semibold text-lg">
                      {booking.numberOfGuests}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600">Email Address</div>
                  <a
                    href={`mailto:${booking.guestEmail}`}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    {booking.guestEmail}
                  </a>
                </div>

                {booking.guestPhone && (
                  <div>
                    <div className="text-sm text-gray-600">Phone Number</div>
                    <a
                      href={`tel:${booking.guestPhone}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      {booking.guestPhone}
                    </a>
                  </div>
                )}

                {booking.specialRequests && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Special Requests</div>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                      {booking.specialRequests}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stay Details */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Check-in</div>
                    <div className="font-semibold text-lg">
                      {format(new Date(booking.checkIn), 'EEEE')}
                    </div>
                    <div className="text-gray-700">
                      {format(new Date(booking.checkIn), 'MMMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">After 4:00 PM</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Check-out</div>
                    <div className="font-semibold text-lg">
                      {format(new Date(booking.checkOut), 'EEEE')}
                    </div>
                    <div className="text-gray-700">
                      {format(new Date(booking.checkOut), 'MMMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">Before 11:00 AM</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600">Total Nights</div>
                  <div className="font-semibold text-2xl text-blue-600">
                    {booking.numberOfNights}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {booking.status === 'PENDING' && (
                    <>
                      <Button
                        onClick={handleConfirmBooking}
                        disabled={updateStatus.isPending}
                      >
                        Confirm Booking
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelBooking}
                        disabled={updateStatus.isPending}
                      >
                        Cancel Booking
                      </Button>
                    </>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <>
                      <Button
                        onClick={handleCompleteBooking}
                        disabled={updateStatus.isPending}
                      >
                        Mark as Completed
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelBooking}
                        disabled={updateStatus.isPending}
                      >
                        Cancel Booking
                      </Button>
                    </>
                  )}

                  {booking.status === 'CANCELLED' && (
                    <div className="p-4 bg-red-50 rounded-lg w-full">
                      <div className="font-semibold text-red-900 mb-1">
                        Booking Cancelled
                      </div>
                      {booking.cancelledAt && (
                        <div className="text-sm text-red-700">
                          Cancelled on{' '}
                          {format(new Date(booking.cancelledAt), 'MMM dd, yyyy')}
                        </div>
                      )}
                      {booking.cancellationReason && (
                        <div className="text-sm text-red-700 mt-2">
                          Reason: {booking.cancellationReason}
                        </div>
                      )}
                    </div>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <div className="p-4 bg-blue-50 rounded-lg w-full">
                      <div className="font-semibold text-blue-900">
                        ✓ Booking Completed
                      </div>
                      <div className="text-sm text-blue-700">
                        Guest has checked out
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    ${booking.pricePerNight.toFixed(0)} × {booking.numberOfNights}{' '}
                    nights
                  </span>
                  <span className="font-semibold">${booking.subtotal}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cleaning fee</span>
                  <span className="font-semibold">${booking.cleaningFee}</span>
                </div>

                {booking.serviceFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee</span>
                    <span className="font-semibold">${booking.serviceFee}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total</span>
                  <span className="text-green-600">${booking.totalPrice}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-lg font-semibold ${getPaymentStatusColor(
                    booking.paymentStatus
                  )}`}
                >
                  {booking.paymentStatus}
                </div>

                {booking.stripePaymentIntentId && (
                  <div className="mt-3 text-xs text-gray-500">
                    <div>Payment Intent:</div>
                    <div className="font-mono break-all">
                      {booking.stripePaymentIntentId}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600">Booked on</div>
                  <div className="font-semibold">
                    {format(new Date(booking.createdAt), 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>

                <div>
                  <div className="text-gray-600">Last updated</div>
                  <div className="font-semibold">
                    {format(new Date(booking.updatedAt), 'MMM dd, yyyy h:mm a')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
