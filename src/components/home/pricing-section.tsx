import Image from 'next/image'
import { Button } from '@/components/ui/button'
import type { PROPERTY } from '@/config/property'

interface PricingSectionProps {
  property: typeof PROPERTY
  onBookingClick: () => void
}

export function PricingSection({ property, onBookingClick }: PricingSectionProps) {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={property.images[12].url}
          alt={property.images[12].altText}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      </div>
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Book Your Stay?
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
            Start planning your unforgettable Texas Hill Country getaway today.
            Your perfect riverside escape is just a few clicks away.
          </p>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl mb-8">
            <div className="inline-block mb-8">
              <div className="text-lg text-gray-500 mb-1">Starting at</div>
              <div className="text-4xl md:text-6xl font-bold text-blue-600">
                ${property.basePrice}
              </div>
              <div className="text-xl text-gray-600">per night</div>
              <div className="text-sm text-gray-500 mt-2">Rates vary by date. Plus taxes and cleaning fee.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-600 mb-2">Minimum Stay</div>
                <div className="text-2xl font-bold">{property.minNights} nights</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-600 mb-2">Check-in</div>
                <div className="text-2xl font-bold">{property.checkInTime}</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-600 mb-2">Check-out</div>
                <div className="text-2xl font-bold">{property.checkOutTime}</div>
              </div>
            </div>

            <Button
              size="lg"
              className="text-xl px-12 py-8 bg-blue-600 hover:bg-blue-700"
              onClick={onBookingClick}
            >
              Check Availability & Book Now
            </Button>
          </div>

          <p className="text-gray-300 text-sm">
            Instant booking confirmation • Secure payment • Free cancellation 24+ hours before check-in
          </p>
        </div>
      </div>
    </section>
  )
}
