import Image from 'next/image'
import type { PROPERTY } from '@/config/property'

interface StatsSectionProps {
  property: typeof PROPERTY
}

export function StatsSection({ property }: StatsSectionProps) {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={property.images[3].url}
          alt={property.images[3].altText}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/90 to-white/95" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Space to Spread Out
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Thoughtfully designed to accommodate your group with room for everyone to relax and recharge
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">
              {property.bedrooms}
            </div>
            <div className="text-gray-600 uppercase tracking-wide text-sm font-semibold">
              Bedrooms
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Comfortable sleeping
            </div>
          </div>
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">
              {property.bathrooms}
            </div>
            <div className="text-gray-600 uppercase tracking-wide text-sm font-semibold">
              Bathrooms
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Modern fixtures
            </div>
          </div>
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">
              {property.maxGuests}
            </div>
            <div className="text-gray-600 uppercase tracking-wide text-sm font-semibold">
              Guests
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Maximum capacity
            </div>
          </div>
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="text-3xl md:text-5xl font-bold text-blue-600 mb-2">
              {property.squareFeet}
            </div>
            <div className="text-gray-600 uppercase tracking-wide text-sm font-semibold">
              Square Feet
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Spacious layout
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
