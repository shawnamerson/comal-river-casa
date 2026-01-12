'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DayPicker, DateRange } from 'react-day-picker'
import { format, differenceInDays, eachDayOfInterval } from 'date-fns'
import 'react-day-picker/dist/style.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PROPERTY } from '@/config/property'
import { trpc } from '@/lib/trpc/client'

export function BookingCalendar() {
  const router = useRouter()
  const [range, setRange] = useState<DateRange | undefined>()
  const [numberOfGuests, setNumberOfGuests] = useState(2)
  const [errorDisplay, setErrorDisplay] = useState<string | null>(null)

  // Safe date range handler
  const handleDateSelect = (newRange: DateRange | undefined) => {
    try {
      setErrorDisplay(null) // Clear any previous errors
      setRange(newRange)
    } catch (error) {
      const errorMsg = `Date selection error: ${error instanceof Error ? error.message : String(error)}`
      console.error('Error selecting dates:', error)
      setErrorDisplay(errorMsg)
    }
  }

  // Fetch booked dates
  const { data: bookedData } = trpc.booking.getBookedDates.useQuery()

  // Calculate disabled dates from bookings and blocked dates
  const getDisabledDates = () => {
    const disabled: Date[] = []

    try {
      if (bookedData?.bookings) {
        // Add booked dates
        bookedData.bookings.forEach((booking) => {
          try {
            const startDate = new Date(booking.checkIn)
            const endDate = new Date(booking.checkOut)

            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              const errorMsg = `Invalid booking dates detected`
              console.warn('Invalid booking dates:', booking)
              setErrorDisplay(errorMsg)
              return
            }

            const dates = eachDayOfInterval({
              start: startDate,
              end: endDate,
            })
            disabled.push(...dates)
          } catch (error) {
            const errorMsg = `Error processing booking: ${error instanceof Error ? error.message : String(error)}`
            console.error('Error processing booking:', booking, error)
            setErrorDisplay(errorMsg)
          }
        })
      }

      if (bookedData?.blockedDates) {
        // Add blocked dates
        bookedData.blockedDates.forEach((blocked) => {
          try {
            const startDate = new Date(blocked.startDate)
            const endDate = new Date(blocked.endDate)

            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              const errorMsg = `Invalid blocked dates detected`
              console.warn('Invalid blocked dates:', blocked)
              setErrorDisplay(errorMsg)
              return
            }

            const dates = eachDayOfInterval({
              start: startDate,
              end: endDate,
            })
            disabled.push(...dates)
          } catch (error) {
            const errorMsg = `Error processing blocked date: ${error instanceof Error ? error.message : String(error)}`
            console.error('Error processing blocked date:', blocked, error)
            setErrorDisplay(errorMsg)
          }
        })
      }
    } catch (error) {
      const errorMsg = `Error calculating disabled dates: ${error instanceof Error ? error.message : String(error)}`
      console.error('Error calculating disabled dates:', error)
      setErrorDisplay(errorMsg)
    }

    return disabled
  }

  const disabledDays = [
    { before: new Date() }, // Disable past dates
    ...getDisabledDates(), // Disable booked/blocked dates
  ]

  const numberOfNights = range?.from && range?.to
    ? differenceInDays(range.to, range.from)
    : 0

  // Fetch dynamic pricing including seasonal rates
  const { data: pricingData } = trpc.booking.calculatePrice.useQuery(
    {
      checkIn: range?.from?.toISOString() || '',
      checkOut: range?.to?.toISOString() || '',
      numberOfGuests: numberOfGuests,
    },
    {
      enabled: !!range?.from && !!range?.to, // Only fetch when dates are selected
    }
  )

  const calculateTotalPrice = () => {
    if (!pricingData || !pricingData.totalPrice) {
      // Fallback to default calculation if pricing data not loaded
      if (numberOfNights === 0) return 0
      const subtotal = numberOfNights * PROPERTY.basePrice
      const total = subtotal + PROPERTY.cleaningFee
      return total
    }
    return pricingData.totalPrice
  }

  const totalPrice = calculateTotalPrice()
  const effectiveMinNights = pricingData?.minNights || PROPERTY.minNights

  const isValidBooking = () => {
    if (!range?.from || !range?.to) return false
    if (numberOfNights < effectiveMinNights) return false
    if (numberOfNights > PROPERTY.maxNights) return false
    if (numberOfGuests < 1 || numberOfGuests > PROPERTY.maxGuests) return false
    return true
  }

  const handleBookNow = () => {
    if (!range?.from || !range?.to || !isValidBooking()) return

    // Navigate to booking page with details including dynamic pricing
    const params = new URLSearchParams({
      checkIn: range.from.toISOString(),
      checkOut: range.to.toISOString(),
      guests: numberOfGuests.toString(),
      nights: numberOfNights.toString(),
      total: totalPrice.toString(),
      pricePerNight: (pricingData?.pricePerNight ?? PROPERTY.basePrice).toString(),
      subtotal: (pricingData?.subtotal ?? numberOfNights * PROPERTY.basePrice).toString(),
      cleaningFee: (pricingData?.cleaningFee ?? PROPERTY.cleaningFee).toString(),
    })

    router.push(`/booking?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Display - Visible on Mobile */}
        {errorDisplay && (
          <div className="bg-red-100 border-2 border-red-500 text-red-900 p-4 rounded-lg">
            <p className="font-bold text-lg mb-2">🔴 Error Detected</p>
            <p className="text-sm break-words">{errorDisplay}</p>
            <button
              onClick={() => setErrorDisplay(null)}
              className="mt-2 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Date Picker */}
        <div>
          <label className="text-sm font-semibold mb-2 block">Select Dates</label>
          <p className="text-xs text-gray-500 mb-3">
            Greyed out dates are unavailable. Select your check-in and check-out dates.
          </p>
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleDateSelect}
            disabled={disabledDays}
            numberOfMonths={1}
            className="border rounded-lg p-3"
          />
        </div>

        {/* Guest Count Selector */}
        <div>
          <label className="text-sm font-semibold mb-2 block">
            Number of Guests
          </label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
              disabled={numberOfGuests <= 1}
            >
              -
            </Button>
            <span className="text-lg font-semibold w-12 text-center">
              {numberOfGuests}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setNumberOfGuests(Math.min(PROPERTY.maxGuests, numberOfGuests + 1))}
              disabled={numberOfGuests >= PROPERTY.maxGuests}
            >
              +
            </Button>
            <span className="text-sm text-gray-600 ml-2">
              (Max {PROPERTY.maxGuests} guests)
            </span>
          </div>
        </div>

        {/* Price Breakdown */}
        {range?.from && range?.to && (
          <div className="border-t pt-4 space-y-2">
            {pricingData && pricingData.hasSeasonalRate && (
              <div className="mb-2 p-2 bg-blue-50 rounded text-xs text-blue-900">
                ⭐ Seasonal pricing applied
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>
                {pricingData?.pricePerNight ? `$${pricingData.pricePerNight.toFixed(0)} avg` : `$${PROPERTY.basePrice}`} × {numberOfNights} nights
              </span>
              <span>${pricingData?.subtotal ?? numberOfNights * PROPERTY.basePrice}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cleaning fee</span>
              <span>${pricingData?.cleaningFee ?? PROPERTY.cleaningFee}</span>
            </div>
            {pricingData?.serviceFee && pricingData.serviceFee > 0 && (
              <div className="flex justify-between text-sm">
                <span>Service fee</span>
                <span>${pricingData.serviceFee}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>

            {numberOfNights < effectiveMinNights && (
              <p className="text-sm text-red-600">
                Minimum stay is {effectiveMinNights} nights
              </p>
            )}
            {numberOfNights > PROPERTY.maxNights && (
              <p className="text-sm text-red-600">
                Maximum stay is {PROPERTY.maxNights} nights
              </p>
            )}
          </div>
        )}

        {/* Selected Dates Display */}
        {range?.from && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Check-in:</span>
              <span>{format(range.from, 'MMM dd, yyyy')} ({PROPERTY.checkInTime})</span>
            </div>
            {range.to && (
              <div className="flex justify-between text-sm">
                <span className="font-semibold">Check-out:</span>
                <span>{format(range.to, 'MMM dd, yyyy')} ({PROPERTY.checkOutTime})</span>
              </div>
            )}
          </div>
        )}

        {/* Book Now Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleBookNow}
          disabled={!isValidBooking()}
        >
          {!range?.from || !range?.to
            ? 'Select dates to book'
            : !isValidBooking()
            ? 'Invalid booking'
            : 'Continue to Booking'}
        </Button>

        <p className="text-xs text-center text-gray-500">
          You won&apos;t be charged yet
        </p>
      </CardContent>
    </Card>
  )
}
