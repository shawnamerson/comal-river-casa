import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from '@/lib/trpc/Provider'
import { Analytics } from "@vercel/analytics/next"
import { PageViewTracker } from '@/components/PageViewTracker'
import { PROPERTY } from '@/config/property'
import { prisma } from '@/lib/db/prisma'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.comalrivercasa.com'),
  title: {
    template: '%s | Comal River Casa',
    default: 'Comal River Casa — Riverfront Vacation Rental in New Braunfels, TX',
  },
  description:
    'Book your stay at Comal River Casa — a riverfront vacation rental in New Braunfels, TX. 2BR/2BA condo with pool, hot tub, and direct Comal River access in the heart of Texas Hill Country.',
  keywords: [
    'Comal River',
    'New Braunfels',
    'vacation rental',
    'Hill Country',
    'Texas',
    'riverfront condo',
    'Comal River tubing',
    'New Braunfels lodging',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Comal River Casa',
    title: 'Comal River Casa — Riverfront Vacation Rental in New Braunfels, TX',
    description:
      'Book your stay at Comal River Casa — a riverfront vacation rental in New Braunfels, TX. 2BR/2BA condo with pool, hot tub, and direct Comal River access.',
    images: ['/images/property/main.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Comal River Casa — Riverfront Vacation Rental in New Braunfels, TX',
    description:
      'Book your stay at Comal River Casa — a riverfront vacation rental in New Braunfels, TX. 2BR/2BA condo with pool, hot tub, and direct Comal River access.',
    images: ['/images/property/main.jpg'],
  },
  alternates: {
    canonical: 'https://www.comalrivercasa.com',
  },
}

async function getJsonLd() {
  const reviews = await prisma.review.findMany({
    where: { isPublished: true },
    select: { rating: true },
  })

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: PROPERTY.name,
    description: PROPERTY.description.split('\n\n')[0],
    url: 'https://www.comalrivercasa.com',
    image: 'https://www.comalrivercasa.com/images/property/main.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '371 W Lincoln St, Unit B114',
      addressLocality: 'New Braunfels',
      addressRegion: 'TX',
      postalCode: '78130',
      addressCountry: 'US',
    },
    numberOfRooms: PROPERTY.bedrooms,
    maximumAttendeeCapacity: PROPERTY.maxGuests,
    amenityFeature: PROPERTY.amenities.map((a) => ({
      '@type': 'LocationFeatureSpecification',
      name: a,
      value: true,
    })),
  }

  if (reviews.length > 0) {
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return jsonLd
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = await getJsonLd()

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
        >
          {JSON.stringify(jsonLd)}
        </script>
      </head>
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  )
}
