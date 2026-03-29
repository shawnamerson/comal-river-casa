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
        <div className="mb-4">
          <Button
            onClick={() => router.push('/manage-booking')}
            variant="outline"
            className="bg-transparent border-white text-white hover:bg-white hover:text-gray-900"
          >
            Manage My Booking
          </Button>
        </div>
        <p className="text-gray-400 mb-8 text-sm">
          Questions, concerns, contact the owner at:{' '}
          <a href="mailto:kodybyron@yahoo.com" className="text-white hover:underline">
            kodybyron@yahoo.com
          </a>
        </p>
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <Link href="/guidebook" className="text-gray-400 hover:text-white transition-colors">
            Local Guide
          </Link>
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
        <div className="flex justify-center gap-6 mb-6">
          <a href="https://www.facebook.com/comalrivercasa" target="_blank" rel="noopener noreferrer me" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
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
