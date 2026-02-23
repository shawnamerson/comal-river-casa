'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROPERTY } from '@/config/property'
import { trpc } from '@/lib/trpc/client'
import { StripeProvider } from '@/components/stripe-provider'
import { PaymentForm } from '@/components/payment-form'

type BookingStep = 'details' | 'payment'

function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState<BookingStep>('details')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

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
      setBookingId(booking.id)
      // Create payment intent after booking is created
      createPaymentIntent.mutate({ bookingId: booking.id })
    },
    onError: (error) => {
      alert(`Error creating booking: ${error.message}`)
    },
  })

  const createPaymentIntent = trpc.booking.createPaymentIntent.useMutation({
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
        setStep('payment')
      }
    },
    onError: (error) => {
      alert(`Error setting up payment: ${error.message}`)
    },
  })

  const confirmPayment = trpc.booking.confirmPayment.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        // Navigate to confirmation page
        const confirmationParams = new URLSearchParams({
          bookingId: bookingId!,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          guests: numberOfGuests || '',
          nights: numberOfNights || '',
          total: totalPrice || '',
        })
        router.push(`/booking/confirmation?${confirmationParams.toString()}`)
      }
    },
  })

  const handleSubmitDetails = (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkIn || !checkOut || !numberOfGuests || !numberOfNights || !totalPrice) {
      alert('Missing booking details')
      return
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    createBooking.mutate({
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      numberOfGuests: parseInt(numberOfGuests),
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      guestPhone: formData.guestPhone || undefined,
      specialRequests: formData.specialRequests || undefined,
    })
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    if (bookingId) {
      confirmPayment.mutate({
        bookingId,
        paymentIntentId,
      })
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
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
        <h1 className="text-4xl font-bold mb-8">
          {step === 'details' ? 'Complete Your Booking' : 'Payment'}
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center ${step === 'details' ? 'text-blue-600' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step === 'details' ? 'bg-blue-600' : 'bg-green-600'}`}>
              {step === 'payment' ? '✓' : '1'}
            </div>
            <span className="ml-2 font-medium">Guest Details</span>
          </div>
          <div className="flex-1 h-1 mx-4 bg-gray-200">
            <div className={`h-full ${step === 'payment' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
          <div className={`flex items-center ${step === 'payment' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === 'details' && (
              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitDetails} className="space-y-4">
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
                      disabled={createBooking.isPending || createPaymentIntent.isPending}
                    >
                      {createBooking.isPending || createPaymentIntent.isPending
                        ? 'Processing...'
                        : 'Continue to Payment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {step === 'payment' && clientSecret && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <StripeProvider clientSecret={clientSecret}>
                    <PaymentForm
                      bookingId={bookingId!}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </StripeProvider>
                </CardContent>
              </Card>
            )}
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
                      ${pricePerNight ? parseFloat(pricePerNight).toFixed(0) : PROPERTY.basePrice} x {numberOfNights} nights
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

                {/* Cancellation Policy */}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-semibold mb-2">Cancellation Policy</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Full refund if cancelled more than 24 hours before check-in</li>
                    <li>• No refund if cancelled within 24 hours of check-in</li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  By completing this booking, you agree to the{' '}
                  <Link href="/policies/cancellation" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
                    Cancellation Policy
                  </Link>
                  ,{' '}
                  <Link href="/policies/house-rules" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
                    House Rules
                  </Link>
                  , and{' '}
                  <Link href="/policies/terms" className="text-blue-600 hover:text-blue-800 underline" target="_blank">
                    Terms of Service
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-gray-600">Loading booking information...</p>
          </div>
        </div>
      </main>
    }>
      <BookingForm />
    </Suspense>
  )
}
