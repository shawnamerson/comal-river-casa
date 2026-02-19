'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { PROPERTY } from '@/config/property'
import { trpc } from '@/lib/trpc/client'

interface CancelResult {
  success: boolean
  refundAmount?: number
  refundEligible?: boolean
  error?: string
}

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
  refundAmount: number | null
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
  const [cancelResult, setCancelResult] = useState<CancelResult | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)

  const lookupBooking = trpc.booking.lookup.useMutation({
    onSuccess: (data) => {
      setBooking(data)
      setLookupError(null)
    },
    onError: (error) => {
      setLookupError(error.message)
    },
  })

  const cancelBooking = trpc.booking.cancel.useMutation({
    onSuccess: (data) => {
      setShowCancelConfirm(false)
      setCancelResult({
        success: true,
        refundAmount: data.refundAmount ?? undefined,
        refundEligible: data.refundEligible,
      })
    },
    onError: (error) => {
      setShowCancelConfirm(false)
      setCancelResult({
        success: false,
        error: error.message,
      })
    },
  })

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    setLookupError(null)
    lookupBooking.mutate({
      bookingId: lookupData.bookingId,
      email: lookupData.email,
    })
  }

  const handleCancel = () => {
    if (booking) {
      cancelBooking.mutate({ bookingId: booking.id, guestEmail: lookupData.email })
    }
  }

  const handleResultClose = () => {
    if (cancelResult?.success) {
      setBooking(null)
      setLookupData({ bookingId: '', email: '' })
    }
    setCancelResult(null)
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
              <CardHeader className={`border-b ${booking.status === 'CANCELLED' ? 'bg-red-50' : 'bg-green-50'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${booking.status === 'CANCELLED' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {booking.status === 'CANCELLED' ? (
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
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
                    )}
                  </div>
                  <CardTitle className={booking.status === 'CANCELLED' ? 'text-red-900' : ''}>
                    {booking.status === 'CONFIRMED' ? 'Active Reservation' :
                     booking.status === 'PENDING' ? 'Pending Confirmation' :
                     booking.status === 'CANCELLED' ? 'Booking Cancelled' :
                     `Booking ${booking.status}`}
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

                {/* Cancellation Details */}
                {booking.status === 'CANCELLED' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="font-semibold text-red-900">This booking has been cancelled</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-red-700 font-medium">Cancelled by</p>
                        <p className="text-red-900">
                          {booking.cancellationReason?.toLowerCase().includes('by guest') ? 'Guest' : 'Property Owner'}
                        </p>
                      </div>
                      {booking.cancelledAt && (
                        <div>
                          <p className="text-red-700 font-medium">Cancelled on</p>
                          <p className="text-red-900">{format(new Date(booking.cancelledAt), 'MMM dd, yyyy h:mm a')}</p>
                        </div>
                      )}
                    </div>

                    {booking.refundAmount !== null && booking.refundAmount > 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-semibold text-green-900">Refund Issued</p>
                        </div>
                        <p className="text-green-800 text-lg font-bold mt-1">${booking.refundAmount.toFixed(2)}</p>
                        <p className="text-green-700 text-xs mt-1">Refunds typically take 5-10 business days to appear on your statement.</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                        <p className="text-gray-700 text-sm">No refund was issued for this cancellation.</p>
                      </div>
                    )}
                  </div>
                )}

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

          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button onClick={() => router.push('/')} variant="ghost">
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Lookup Error Modal */}
      <Modal isOpen={!!lookupError} onClose={() => setLookupError(null)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Booking Not Found</h3>
          </div>
          <p className="text-gray-600 mb-6">{lookupError}</p>
          <Button onClick={() => setLookupError(null)} className="w-full">
            Try Again
          </Button>
        </div>
      </Modal>

      {/* Cancel Confirmation Modal */}
      {booking && (
        <Modal isOpen={showCancelConfirm} onClose={() => setShowCancelConfirm(false)}>
          {(() => {
            const now = new Date()
            const checkIn = new Date(booking.checkIn)
            const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60)
            const willGetRefund = booking.status === 'PENDING' || hoursUntilCheckIn > 24

            return (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Booking?</h3>
                </div>

                <p className="text-gray-600 mb-4">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>

                {/* Refund Status */}
                {willGetRefund ? (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">You will receive a full refund</p>
                    <p className="text-green-700 text-sm">
                      {booking.status === 'PENDING'
                        ? 'Your booking has not been confirmed yet.'
                        : 'You are cancelling more than 24 hours before check-in.'}
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
                    {cancelBooking.isPending ? 'Cancelling...' : 'Yes, Cancel'}
                  </Button>
                </div>
              </div>
            )
          })()}
        </Modal>
      )}

      {/* Cancel Result Modal */}
      <Modal isOpen={!!cancelResult} onClose={handleResultClose}>
        <div className="p-6">
          {cancelResult?.success ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Booking Cancelled</h3>
              </div>

              {cancelResult.refundAmount && cancelResult.refundAmount > 0 ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold mb-1">Refund Issued</p>
                  <p className="text-green-900 text-2xl font-bold">${cancelResult.refundAmount.toFixed(2)}</p>
                  <p className="text-green-700 text-sm mt-2">
                    Refunds typically take 5-10 business days to appear on your statement.
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 mb-6">
                  Your booking has been cancelled. No refund was issued as per the cancellation policy.
                </p>
              )}

              <Button onClick={handleResultClose} className="w-full">
                Done
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cancellation Failed</h3>
              </div>
              <p className="text-gray-600 mb-6">{cancelResult?.error || 'An error occurred while cancelling your booking.'}</p>
              <Button onClick={handleResultClose} className="w-full">
                Try Again
              </Button>
            </>
          )}
        </div>
      </Modal>
    </main>
  )
}
