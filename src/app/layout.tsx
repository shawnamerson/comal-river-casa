import type { Metadata } from 'next'
import Script from 'next/script'
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
    default: 'New Braunfels Vacation Rental Sleeps 8 | Comal River Casa',
  },
  description:
    '2BR/2BA condo in New Braunfels, steps away from the Comal River and across from Schlitterbahn. Sleeps 8, 2 king beds, pool, hot tub, free tubes. Book direct.',
  keywords: [
    'Comal River',
    'New Braunfels',
    'vacation rental',
    'Hill Country',
    'Texas',
    'Schlitterbahn lodging',
    'Comal River tubing',
    'New Braunfels lodging',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Comal River Casa',
    title: 'New Braunfels Vacation Rental Sleeps 8 | Comal River Casa',
    description:
      '2BR/2BA condo in New Braunfels, steps away from the Comal River and across from Schlitterbahn. Sleeps 8, 2 king beds, pool, hot tub, free tubes. Book direct.',
    images: ['/images/property/main.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Braunfels Vacation Rental Sleeps 8 | Comal River Casa',
    description:
      '2BR/2BA condo in New Braunfels, steps away from the Comal River and across from Schlitterbahn. Sleeps 8, 2 king beds, pool, hot tub, free tubes. Book direct.',
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
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 29.70238,
      longitude: -98.11803,
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=100090102757752',
      'https://www.instagram.com/comalrivercasa',
      'https://www.airbnb.com/rooms/816620048732083081',
      'https://www.vrbo.com/3227805',
    ],
    checkinTime: '16:00',
    checkoutTime: '11:00',
    priceRange: '$200+',
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
          // Raw JSX text children get HTML-escaped on the server (e.g. " -> &quot;),
          // which browsers don't decode back inside <script> — producing invalid
          // JSON for crawlers and a server/client hydration mismatch. innerHTML
          // bypasses that escaping so server and client output match exactly.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </head>
      <body className={inter.className}>
        <TRPCProvider>{children}</TRPCProvider>
        <PageViewTracker />
        <Analytics />
        {/* Meta Pixel — Comal River Casa Website (dataset 1462709905388209) */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1462709905388209');fbq('track', 'PageView');`}
        </Script>
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1462709905388209&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  )
}
