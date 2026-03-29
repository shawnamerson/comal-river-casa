import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Your Stay',
  description:
    'Complete your booking at Comal River Casa — a riverfront vacation rental in New Braunfels, TX.',
  openGraph: {
    type: 'website',
    title: 'Book Your Stay at Comal River Casa',
    description: '2BR/2BA riverfront condo in New Braunfels, TX — pool, hot tub, and river access.',
    images: ['/images/property/main.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Your Stay at Comal River Casa',
    description: '2BR/2BA riverfront condo in New Braunfels, TX — pool, hot tub, and river access.',
    images: ['/images/property/main.jpg'],
  },
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
