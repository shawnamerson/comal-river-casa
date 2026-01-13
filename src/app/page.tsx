'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PROPERTY } from '@/config/property'
import { BookingCalendar } from '@/components/booking-calendar'
import { ErrorBoundary } from '@/components/error-boundary'

export default function Home() {
  const router = useRouter()
  const [showBooking, setShowBooking] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<number | null>(null)

  const handleBookingClick = () => {
    setShowBooking(true)
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const openLightbox = (index: number) => {
    setLightboxImage(index)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const nextImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage + 1) % property.images.length)
    }
  }

  const previousImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage - 1 + property.images.length) % property.images.length)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') previousImage()
  }

  const property = PROPERTY
  const heroImage = '/images/property/gruene.jpg'
  const heroAlt = 'Historic Gruene, New Braunfels, Texas'

  return (
    <main className="min-h-screen bg-white">
      {/* Full Screen Hero Section */}
      <div className="relative h-screen w-full">
        <Image
          src={heroImage}
          alt={heroAlt}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <div className="text-center max-w-4xl">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              {property.name}
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-4 font-light">
              Your Texas Hill Country Escape
            </p>
            <p className="text-lg md:text-xl mb-8 text-gray-200">
              {property.city}, {property.state}
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100"
              onClick={handleBookingClick}
            >
              Check Availability
            </Button>
          </div>
        </div>
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>

      {/* New Braunfels Experience Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Discover New Braunfels
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Where Texas Hill Country charm meets endless adventure on the crystal-clear waters of the Comal River
            </p>
          </div>

          {/* River Tubing - Image Left */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/property/tubing.jpg"
                alt="Comal River Tubing"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900 text-center md:text-left">River Tubing Paradise</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Float down the pristine Comal River, one of the shortest and most beautiful rivers in Texas.
                Crystal-clear spring-fed waters maintain a perfect 72°F year-round. Tube chutes, rope swings,
                and lazy river sections create the ultimate tubing experience.
              </p>
            </div>
          </div>

          {/* Schlitterbahn - Image Right */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-6 order-2 md:order-1">
              <h3 className="text-3xl font-bold text-gray-900 text-center md:text-left">Schlitterbahn Waterpark</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Home to America&apos;s #1 rated waterpark! Experience thrilling water slides, the world&apos;s
                first uphill water coaster, lazy rivers, and family-friendly attractions. Just minutes from
                your door to endless summer fun.
              </p>
            </div>
            <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
              <Image
                src="/images/property/Schlitterbahn_waterpark.jpg"
                alt="Schlitterbahn Waterpark"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Hill Country Culture - Image Left */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/property/wurst.jpg"
                alt="German Wurstfest Culture"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">Texas Hill Country Culture</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Savor authentic Texas BBQ, explore German heritage in historic Gruene, browse local wineries
                and breweries, and discover live music venues. Shop antique stores, artisan boutiques, and
                the famous Gruene Hall, Texas&apos; oldest dance hall.
              </p>
            </div>
          </div>

          {/* Natural Wonders - Image Right */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-6 order-2 md:order-1">
              <h3 className="text-3xl font-bold text-gray-900 text-center md:text-left">Natural Wonders</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Explore Natural Bridge Caverns, one of the largest underground cave systems in Texas.
                Hike scenic trails through Hill Country landscapes, discover hidden swimming holes,
                and witness spectacular sunsets over rolling hills.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Landa Park offers 51 acres of spring-fed swimming, miniature golf, paddleboats,
                and shaded picnic areas perfect for family outings.
              </p>
            </div>
            <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
              <Image
                src="/images/property/natural-bridge-caverns.jpg"
                alt="Natural Bridge Caverns"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Entertainment - Image Left */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/property/live-music.jpg"
                alt="Live Music and Entertainment"
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900 text-center md:text-left">Entertainment & Events</h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Experience live music at historic Gruene Hall where legends like Willie Nelson have played.
                Enjoy seasonal festivals celebrating German heritage, wine country tours through nearby
                vineyards, and vibrant downtown nightlife.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Year-round events include Wurstfest, Christmas markets, and outdoor concerts under
                the Texas stars.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Perfect Home Base Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Your Perfect Home Base
            </h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              After a day of adventure, retreat to your riverside haven with stunning views and modern comforts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={property.images[1].url}
                alt={property.images[1].altText}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Your Hill Country Haven Awaits
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {property.description}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you&apos;re seeking adventure on the crystal-clear Comal River or a peaceful escape
                under the Texas stars, our casa offers the perfect blend of comfort and natural beauty.
                Wake up to stunning views, spend your days floating down the river, and end each evening
                on the patio watching the sunset paint the Hill Country sky.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h3 className="text-3xl font-bold text-gray-900 text-center md:text-left">
                Comfort Meets Luxury
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Step inside to discover a beautifully appointed space designed for both relaxation and
                entertainment. Our open-concept living area flows seamlessly from the gourmet kitchen to
                the inviting living room, perfect for gathering with family and friends.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Every detail has been carefully considered to ensure your stay is nothing short of
                exceptional. From premium bedding to modern appliances, we&apos;ve thought of everything
                so you don&apos;t have to.
              </p>
            </div>
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
              <Image
                src={property.images[2].url}
                alt={property.images[2].altText}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
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
              <div className="text-5xl font-bold text-blue-600 mb-2">
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
              <div className="text-5xl font-bold text-blue-600 mb-2">
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
              <div className="text-5xl font-bold text-blue-600 mb-2">
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
              <div className="text-5xl font-bold text-blue-600 mb-2">
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

      {/* Amenities Showcase */}
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
              <h3 className="text-3xl font-bold text-gray-900">
                Fully Equipped for Your Comfort
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                From the moment you arrive, you&apos;ll find everything you need for a comfortable and
                convenient stay. Our fully equipped kitchen features modern appliances perfect for
                preparing family meals, while high-speed WiFi keeps you connected when needed.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
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

      {/* Photo Gallery Section */}
      {property.images.length > 1 && (
        <section className="py-24 px-4 bg-gray-900 text-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                See Yourself Here
              </h2>
              <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
              <p className="text-xl text-gray-300">
                Explore our beautifully designed space
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {property.images.slice(1, 7).map((image, index) => (
                <div
                  key={index}
                  className="relative h-64 rounded-lg overflow-hidden group cursor-pointer"
                  onClick={() => openLightbox(index + 1)}
                >
                  <Image
                    src={image.url}
                    alt={image.altText}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="text-white text-4xl">🔍</div>
                  </div>
                </div>
              ))}
            </div>

            {property.images.length > 7 && (
              <div className="text-center mt-8">
                <p className="text-gray-400">
                  + {property.images.length - 7} more photos
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Guest Reviews */}
      {property.reviews.length > 0 && (
        <section className="py-24 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Guest Experiences
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600">
                Hear what our guests have to say
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {property.reviews.map((review) => (
                <Card key={review.id} className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-blue-600">
                          {review.guestName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{review.guestName}</div>
                        <div className="text-yellow-500 text-xl">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing Preview Section */}
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
                <div className="text-5xl md:text-6xl font-bold text-blue-600">
                  ${property.basePrice}
                </div>
                <div className="text-xl text-gray-600">per night</div>
                <div className="text-sm text-gray-500 mt-2">Plus taxes and cleaning fee</div>
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
                onClick={handleBookingClick}
              >
                Check Availability & Book Now
              </Button>
            </div>

            <p className="text-gray-300 text-sm">
              Instant booking confirmation • Secure payment • Flexible cancellation
            </p>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      {showBooking && (
        <section id="booking-section" className="py-24 px-4 bg-gradient-to-br from-blue-50 to-gray-50">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Make Your Reservation
              </h2>
              <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
              <p className="text-xl text-gray-600">
                Select your dates and start planning your perfect getaway
              </p>
            </div>
            <ErrorBoundary>
              <BookingCalendar />
            </ErrorBoundary>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">{property.name}</h3>
          <p className="text-gray-400 mb-8">
            {property.city}, {property.state}
          </p>
          <div className="mb-8">
            <Button
              onClick={() => router.push('/manage-booking')}
              variant="outline"
              className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
            >
              Manage My Booking
            </Button>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              &copy; 2026 Comal River Casa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-50"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>

          {/* Previous Button */}
          <button
            className="absolute left-2 md:left-4 text-white text-4xl md:text-5xl hover:text-gray-300 transition-colors z-50 bg-black/30 w-12 h-12 rounded-full flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              previousImage()
            }}
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={property.images[lightboxImage].url}
              alt={property.images[lightboxImage].altText}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Next Button */}
          <button
            className="absolute right-2 md:right-4 text-white text-4xl md:text-5xl hover:text-gray-300 transition-colors z-50 bg-black/30 w-12 h-12 rounded-full flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            aria-label="Next"
          >
            ›
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm md:text-lg bg-black/50 px-3 md:px-4 py-1 md:py-2 rounded-full">
            {lightboxImage + 1} / {property.images.length}
          </div>

          {/* Image Caption */}
          <div className="absolute bottom-14 md:bottom-16 left-1/2 transform -translate-x-1/2 text-white text-center max-w-2xl px-4">
            <p className="text-sm md:text-lg">{property.images[lightboxImage].altText}</p>
          </div>
        </div>
      )}
    </main>
  )
}
