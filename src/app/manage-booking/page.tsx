'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROPERTY } from '@/config/property'
import { trpc } from '@/lib/trpc/client'

interface BookingData {
  id: string
  userId: string
  checkIn: string
  checkOut: string
  numberOfGuests: number
  guestName: string
  guestEmail: string
  guestPhone: string | null
  numberOfNights: number
  pricePerNight: number
  subtotal: number
  cleaningFee: number
  serviceFee: number
  totalPrice: number
  specialRequests: string | null
  status: string
  paymentStatus: string
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
}

export default function ManageBookingPage() {
  const router = useRouter()
  const [lookupData, setLookupData] = useState({
    bookingId: '',
    email: '',
  })
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const lookupBooking = trpc.booking.lookup.useMutation({
    onSuccess: (data) => {
      setBooking(data)
    },
    onError: (error) => {
      alert(`Error: ${error.message}`)
    },
  })

  const cancelBooking = trpc.booking.cancel.useMutation({
    onSuccess: (data) => {
      if (data.refundAmount) {
        alert(`Booking cancelled successfully. A refund of $${data.refundAmount.toFixed(2)} has been processed.`)
      } else if (data.refundEligible === false) {
        alert('Booking cancelled. No refund was issued as per the cancellation policy.')
      } else {
        alert('Booking cancelled successfully.')
      }
      setBooking(null)
      setLookupData({ bookingId: '', email: '' })
      setShowCancelConfirm(false)
    },
    onError: (error) => {
      alert(`Error cancelling booking: ${error.message}`)
    },
  })

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    lookupBooking.mutate({
      bookingId: lookupData.bookingId,
      email: lookupData.email,
    })
  }

  const handleCancel = () => {
    if (booking) {
      cancelBooking.mutate({ bookingId: booking.id })
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Manage Your Booking</h1>
          <p className="text-gray-600">
            Enter your confirmation number and email to view or modify your reservation
          </p>
        </div>

        {!booking ? (
          // Lookup Form
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle>Find Your Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Confirmation Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., cm5a1b2c3d4e5f6g7h8i9"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={lookupData.bookingId}
                    onChange={(e) =>
                      setLookupData({ ...lookupData, bookingId: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Found in your confirmation email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={lookupData.email}
                    onChange={(e) =>
                      setLookupData({ ...lookupData, email: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The email used when making the reservation
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={lookupBooking.isPending}
                >
                  {lookupBooking.isPending ? 'Searching...' : 'Find My Booking'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Don&apos;t have your confirmation number?
                </p>
                <p className="text-xs text-gray-500">
                  Check your email for the booking confirmation or contact us for assistance.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Booking Details
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-green-50 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <CardTitle>
                    {booking.status === 'CONFIRMED' ? 'Active Reservation' : `Booking ${booking.status}`}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Confirmation Number */}
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900 font-mono break-all">
                    {booking.id}
                  </p>
                </div>

                {/* Guest Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Guest Name</p>
                    <p className="text-lg">{booking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Email</p>
                    <p className="text-lg break-words">{booking.guestEmail}</p>
                  </div>
                </div>

                {booking.guestPhone && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Phone</p>
                    <p className="text-lg">{booking.guestPhone}</p>
                  </div>
                )}

                {/* Property Info */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-lg mb-2">{PROPERTY.name}</h3>
                  <p className="text-gray-600">
                    {PROPERTY.city}, {PROPERTY.state}
                  </p>
                </div>

                {/* Stay Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Check-in</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">{PROPERTY.checkInTime}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Check-out</p>
                    <p className="text-lg font-semibold">
                      {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">{PROPERTY.checkOutTime}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Guests</p>
                    <p className="text-lg font-semibold">{booking.numberOfGuests} guests</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Nights</p>
                    <p className="text-lg font-semibold">{booking.numberOfNights} nights</p>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-gray-600 mb-1">Special Requests</p>
                    <p className="text-gray-700">{booking.specialRequests}</p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>${booking.pricePerNight} × {booking.numberOfNights} nights</span>
                    <span>${booking.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cleaning fee</span>
                    <span>${booking.cleaningFee}</span>
                  </div>
                  {booking.serviceFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Service fee</span>
                      <span>${booking.serviceFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${booking.totalPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => {
                  setBooking(null)
                  setLookupData({ bookingId: '', email: '' })
                }}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Look Up Another Booking
              </Button>

              {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                <Button
                  onClick={() => setShowCancelConfirm(true)}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  Cancel Booking
                </Button>
              )}
            </div>

            {/* Cancel Confirmation Dialog */}
            {showCancelConfirm && (() => {
              const now = new Date()
              const checkIn = new Date(booking.checkIn)
              const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)
              const willGetRefund = booking.status === 'PENDING' || hoursUntilCheckIn > 24

              return (
                <Card className="border-red-500 border-2">
                  <CardHeader className="bg-red-50">
                    <CardTitle className="text-red-900">Cancel Booking?</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="mb-4 text-gray-700">
                      Are you sure you want to cancel this booking? This action cannot be undone.
                    </p>

                    {/* Refund Status */}
                    {willGetRefund ? (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-semibold">You will receive a full refund</p>
                        <p className="text-green-700 text-sm">
                          {booking.status === 'PENDING'
                            ? 'Your booking has not been confirmed yet.'
                            : `You are cancelling more than 24 hours before check-in.`}
                        </p>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-semibold">No refund available</p>
                        <p className="text-red-700 text-sm">
                          Cancellations within 24 hours of check-in are not eligible for a refund.
                        </p>
                      </div>
                    )}

                    {/* Cancellation Policy */}
                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-semibold mb-2">Cancellation Policy</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Full refund if cancelled before owner confirms</li>
                        <li>• Full refund if cancelled more than 24 hours before check-in</li>
                        <li>• No refund if cancelled within 24 hours of check-in</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowCancelConfirm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Keep Booking
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="destructive"
                        className="flex-1"
                        disabled={cancelBooking.isPending}
                      >
                        {cancelBooking.isPending ? 'Cancelling...' : 'Yes, Cancel Booking'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })()}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button onClick={() => router.push('/')} variant="ghost">
            ← Back to Home
          </Button>
        </div>
      </div>
    </main>
  )
}
