import type { Metadata } from 'next'
import AdminHeader from './_components/AdminHeader'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AdminHeader />
        {children}
      </div>
    </main>
  )
}
