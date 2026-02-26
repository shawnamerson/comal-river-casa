import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TRPCProvider } from '@/lib/trpc/Provider'
import { Analytics } from "@vercel/analytics/next"
import { PROPERTY } from '@/config/property'

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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LodgingBusiness',
  name: PROPERTY.name,
  description: PROPERTY.description.split('\n\n')[0],
  url: 'https://www.comalrivercasa.com',
  image: 'https://www.comalrivercasa.com/images/property/main.jpg',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'New Braunfels',
    addressRegion: 'TX',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
        <Analytics />
      </body>
    </html>
  )
}
