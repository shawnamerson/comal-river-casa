'use client'

import { useState, useEffect } from 'react'
import { PROPERTY } from '@/config/property'
import { BookingCalendar } from '@/components/booking-calendar'
import { ErrorBoundary } from '@/components/error-boundary'
import { trpc } from '@/lib/trpc/client'
import { HeroSection } from '@/components/home/hero-section'
import { DiscoverSection } from '@/components/home/discover-section'
import { HomeBaseSection } from '@/components/home/home-base-section'
import { StatsSection } from '@/components/home/stats-section'
import { AmenitiesSection } from '@/components/home/amenities-section'
import { GallerySection } from '@/components/home/gallery-section'
import { ReviewsSection } from '@/components/home/reviews-section'
import { PricingSection } from '@/components/home/pricing-section'
import { FooterSection } from '@/components/home/footer-section'

export default function Home() {
  const [showBooking, setShowBooking] = useState(false)
  const { data: reviews } = trpc.review.getPublishedReviews.useQuery()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBookingClick = () => {
    setShowBooking(true)
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const property = PROPERTY

  return (
    <main className="min-h-screen bg-white">
      <HeroSection
        propertyName={property.name}
        city={property.city}
        state={property.state}
        onBookingClick={handleBookingClick}
      />
      <DiscoverSection />
      <HomeBaseSection property={property} />
      <StatsSection property={property} />
      <AmenitiesSection property={property} />
      <GallerySection images={property.images} />
      {reviews && reviews.length > 0 && (
        <ReviewsSection reviews={reviews} />
      )}
      <PricingSection property={property} onBookingClick={handleBookingClick} />

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

      <FooterSection
        propertyName={property.name}
        city={property.city}
        state={property.state}
      />
    </main>
  )
}
