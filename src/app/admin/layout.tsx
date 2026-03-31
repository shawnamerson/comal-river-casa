import type { Metadata } from 'next'
import AdminHeader from './_components/AdminHeader'
import EmailVerificationGate from './_components/EmailVerificationGate'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  let emailVerified = true
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    })
    emailVerified = user?.emailVerified != null
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <AdminHeader />
        {emailVerified ? children : <EmailVerificationGate />}
      </div>
    </main>
  )
}
