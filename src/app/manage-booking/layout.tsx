import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Manage My Booking',
  robots: { index: false, follow: false },
}

export default function ManageBookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
