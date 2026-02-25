'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
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

  // Damage charge state
  const [showDamageForm, setShowDamageForm] = useState(false)
  const [damageAmount, setDamageAmount] = useState('')
  const [damageDescription, setDamageDescription] = useState('')

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

  const chargeDamage = trpc.admin.chargeDamage.useMutation({
    onSuccess: () => {
      refetch()
      setShowDamageForm(false)
      setDamageAmount('')
      setDamageDescription('')
      alert('Damage charge processed successfully')
    },
    onError: (error) => {
      alert(`Error: ${error.message}`)
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
                    <Button
                      variant="outline"
                      onClick={handleCancelBooking}
                      disabled={updateStatus.isPending}
                    >
                      Cancel Booking
                    </Button>
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
                    <div className="p-4 bg-red-50 rounded-lg w-full space-y-3">
                      <div className="font-semibold text-red-900">
                        Booking Cancelled
                      </div>
                      {booking.cancelledAt && (
                        <div className="text-sm text-red-700">
                          Cancelled on{' '}
                          {format(new Date(booking.cancelledAt), 'MMM dd, yyyy h:mm a')}
                        </div>
                      )}
                      {booking.cancellationReason && (
                        <div className="text-sm text-red-700">
                          Reason: {booking.cancellationReason}
                        </div>
                      )}
                      {booking.refundAmount !== null && booking.refundAmount > 0 ? (
                        <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                          <div className="font-semibold text-green-900">Refund Issued</div>
                          <div className="text-green-800 text-lg font-bold">${booking.refundAmount.toFixed(2)}</div>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                          <div className="text-gray-700 text-sm">No refund issued</div>
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

            {/* Damage Charges */}
            {(booking.damageCharges.length > 0 || (['CONFIRMED', 'COMPLETED'].includes(booking.status) && booking.paymentStatus === 'SUCCEEDED')) && (
              <Card>
                <CardHeader>
                  <CardTitle>Damage Charges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Existing damage charges */}
                  {booking.damageCharges.length > 0 && (
                    <div className="space-y-2">
                      {booking.damageCharges.map((dc) => (
                        <div key={dc.id} className="flex items-start justify-between gap-3 border rounded-lg p-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-lg">${dc.amount.toFixed(2)}</div>
                            <div className="text-sm text-gray-600 mt-0.5">{dc.description}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{format(new Date(dc.createdAt), 'MMM dd, yyyy h:mm a')}</div>
                          </div>
                          <div className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                            dc.status === 'SUCCEEDED' ? 'bg-green-100 text-green-800' :
                            dc.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dc.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Charge form — only for active bookings with payment */}
                  {!['CONFIRMED', 'COMPLETED'].includes(booking.status) || booking.paymentStatus !== 'SUCCEEDED' ? null : !booking.stripeCustomerId ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-semibold text-yellow-900">No saved payment method</div>
                      <div className="text-sm text-yellow-700 mt-1">
                        This booking was created before card-saving was enabled. Damage charges cannot be processed automatically.
                      </div>
                    </div>
                  ) : !showDamageForm ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowDamageForm(true)}
                    >
                      Charge for Damages
                    </Button>
                  ) : (
                    <div className="space-y-3 border border-orange-200 rounded-lg p-4 bg-orange-50">
                      <div className="font-semibold text-orange-900">Charge guest&apos;s saved card</div>
                      <p className="text-sm text-orange-700">
                        This will immediately charge the guest&apos;s card on file and send them a notification email.
                      </p>
                      <div>
                        <label className="text-sm text-gray-700 block mb-1">Amount ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.50"
                          max="10000"
                          placeholder="50.00"
                          value={damageAmount}
                          onChange={(e) => setDamageAmount(e.target.value)}
                          className="w-full border border-orange-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 block mb-1">Description</label>
                        <textarea
                          placeholder="Describe the damage..."
                          value={damageDescription}
                          onChange={(e) => setDamageDescription(e.target.value)}
                          className="w-full border border-orange-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            const amount = parseFloat(damageAmount)
                            if (!amount || amount <= 0 || !damageDescription.trim()) return
                            chargeDamage.mutate({ bookingId, amount, description: damageDescription.trim() })
                          }}
                          disabled={chargeDamage.isPending || !damageAmount || !damageDescription.trim()}
                        >
                          {chargeDamage.isPending ? 'Charging...' : 'Confirm Charge'}
                        </Button>
                        <Button variant="outline" onClick={() => { setShowDamageForm(false); chargeDamage.reset() }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
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
