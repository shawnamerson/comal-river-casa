import Image from 'next/image'
import type { PROPERTY } from '@/config/property'

interface AmenitiesSectionProps {
  property: typeof PROPERTY
}

export function AmenitiesSection({ property }: AmenitiesSectionProps) {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern amenities and thoughtful touches to make your stay unforgettable
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={property.images[4].url}
              alt={property.images[4].altText}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-xl md:text-3xl font-bold text-gray-900 text-center md:whitespace-nowrap">
              Fully Equipped for Your Comfort
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              From the moment you arrive, you&apos;ll find everything you need for a comfortable and
              convenient stay. Our fully equipped kitchen features modern appliances perfect for
              preparing family meals, while high-speed WiFi keeps you connected when needed.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Relax in climate-controlled comfort, enjoy your favorite shows on smart TVs throughout
              the property, and take advantage of our in-unit washer and dryer for ultimate convenience.
              We&apos;ve stocked the essentials so you can focus on making memories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {property.amenities.map((amenity, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl text-blue-600">✓</span>
              </div>
              <p className="text-center font-medium text-gray-800">{amenity}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
