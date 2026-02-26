import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Your Stay',
  description:
    'Complete your booking at Comal River Casa — a riverfront vacation rental in New Braunfels, TX.',
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
