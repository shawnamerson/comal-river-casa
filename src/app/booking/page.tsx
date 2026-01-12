'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROPERTY } from '@/config/property'
import { trpc } from '@/lib/trpc/client'

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  })

  // Get booking details from URL params
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const numberOfGuests = searchParams.get('guests')
  const numberOfNights = searchParams.get('nights')
  const totalPrice = searchParams.get('total')
  const pricePerNight = searchParams.get('pricePerNight')
  const subtotal = searchParams.get('subtotal')
  const cleaningFee = searchParams.get('cleaningFee')

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (booking) => {
      alert(`Booking confirmed! Booking ID: ${booking.id}`)
      router.push('/')
    },
    onError: (error) => {
      alert(`Error creating booking: ${error.message}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkIn || !checkOut || !numberOfGuests || !numberOfNights || !totalPrice) {
      alert('Missing booking details')
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = parseInt(numberOfNights)
    const total = parseFloat(totalPrice)

    // Use seasonal pricing values if available, otherwise use defaults
    const effectivePricePerNight = pricePerNight ? parseFloat(pricePerNight) : PROPERTY.basePrice
    const effectiveSubtotal = subtotal ? parseFloat(subtotal) : (nights * PROPERTY.basePrice)
    const effectiveCleaningFee = cleaningFee ? parseFloat(cleaningFee) : PROPERTY.cleaningFee

    const bookingData = {
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      numberOfGuests: parseInt(numberOfGuests),
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      guestPhone: formData.guestPhone || undefined,
      numberOfNights: nights,
      pricePerNight: effectivePricePerNight,
      subtotal: effectiveSubtotal,
      cleaningFee: effectiveCleaningFee,
      serviceFee: 0,
      totalPrice: total,
      specialRequests: formData.specialRequests || undefined,
    }

    console.log('Sending booking data:', bookingData)
    createBooking.mutate(bookingData)
  }

  if (!checkIn || !checkOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-center">Invalid booking details</p>
            <Button onClick={() => router.push('/')} className="mt-4 w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Complete Your Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Guest Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.guestName}
                      onChange={(e) =>
                        setFormData({ ...formData, guestName: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.guestEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, guestEmail: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.guestPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, guestPhone: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Special Requests (optional)
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({ ...formData, specialRequests: e.target.value })
                      }
                      placeholder="Any special requests or requirements?"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={createBooking.isPending}
                  >
                    {createBooking.isPending ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{PROPERTY.name}</h3>
                  <p className="text-sm text-gray-600">
                    {PROPERTY.city}, {PROPERTY.state}
                  </p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div>
                    <p className="text-sm font-semibold">Check-in</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(checkIn), 'MMM dd, yyyy')} ({PROPERTY.checkInTime})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Check-out</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(checkOut), 'MMM dd, yyyy')} ({PROPERTY.checkOutTime})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Guests</p>
                    <p className="text-sm text-gray-600">{numberOfGuests} guests</p>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      ${pricePerNight ? parseFloat(pricePerNight).toFixed(0) : PROPERTY.basePrice} × {numberOfNights} nights
                    </span>
                    <span>
                      ${subtotal || (parseFloat(totalPrice!) - (cleaningFee ? parseFloat(cleaningFee) : PROPERTY.cleaningFee)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cleaning fee</span>
                    <span>${cleaningFee || PROPERTY.cleaningFee}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  By confirming this booking, you agree to the property&apos;s cancellation policy
                  and house rules.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
