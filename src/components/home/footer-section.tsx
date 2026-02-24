'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface FooterSectionProps {
  propertyName: string
  city: string
  state: string
}

export function FooterSection({ propertyName, city, state }: FooterSectionProps) {
  const router = useRouter()

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">{propertyName}</h3>
        <p className="text-gray-400 mb-8">
          {city}, {state}
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
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <Link href="/policies/cancellation" className="text-gray-400 hover:text-white transition-colors">
            Cancellation Policy
          </Link>
          <Link href="/policies/house-rules" className="text-gray-400 hover:text-white transition-colors">
            House Rules
          </Link>
          <Link href="/policies/terms" className="text-gray-400 hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-400">
            &copy; 2026 Comal River Casa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
