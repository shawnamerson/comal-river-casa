'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROPERTY } from '@/config/property'

function ConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const bookingId = searchParams.get('bookingId')
  const guestName = searchParams.get('guestName')
  const guestEmail = searchParams.get('guestEmail')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const numberOfGuests = searchParams.get('guests')
  const numberOfNights = searchParams.get('nights')
  const totalPrice = searchParams.get('total')

  if (!bookingId || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">No booking confirmation found</p>
            <Button onClick={() => router.push('/')} className="mt-4 w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-12 h-12 text-white"
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your reservation, {guestName}
          </p>
        </div>

        {/* Confirmation Details */}
        <Card className="mb-6">
          <CardHeader className="bg-blue-600 text-white">
            <CardTitle className="text-center">Reservation Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Booking ID */}
            <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-600 mb-1">Confirmation Number</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 font-mono break-all">{bookingId}</p>
            </div>

            {/* Property Info */}
            <div>
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
                  {format(new Date(checkIn), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-600">{PROPERTY.checkInTime}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Check-out</p>
                <p className="text-lg font-semibold">
                  {format(new Date(checkOut), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-600">{PROPERTY.checkOutTime}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Guests</p>
                <p className="text-lg font-semibold">{numberOfGuests} guests</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Nights</p>
                <p className="text-lg font-semibold">{numberOfNights} nights</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-600 mb-1">Contact Email</p>
              <p className="text-lg">{guestEmail}</p>
            </div>

            {/* Total Price */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold">Total Paid</span>
                <span className="text-3xl font-bold text-blue-600">${totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-semibold">Check Your Email</p>
                <p className="text-sm text-gray-600">
                  A confirmation email has been sent to {guestEmail} with all the details of your reservation.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-semibold">Prepare for Your Stay</p>
                <p className="text-sm text-gray-600">
                  Check-in instructions and property access details will be sent to you 24 hours before your arrival.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-semibold">Questions?</p>
                <p className="text-sm text-gray-600">
                  If you have any questions or need to make changes, please contact us using the confirmation number above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => router.push('/')}
            className="flex-1"
            size="lg"
          >
            Return to Home
          </Button>
          <Button
            onClick={() => router.push('/manage-booking')}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Manage Booking
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Print Confirmation
          </Button>
        </div>
      </div>
    </main>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-gray-600">Loading confirmation...</p>
          </div>
        </div>
      </main>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
