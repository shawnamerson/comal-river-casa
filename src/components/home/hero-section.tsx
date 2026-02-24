import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface HeroSectionProps {
  propertyName: string
  city: string
  state: string
  onBookingClick: () => void
}

export function HeroSection({ propertyName, city, state, onBookingClick }: HeroSectionProps) {
  return (
    <div className="relative h-screen w-full">
      <Image
        src="/images/property/gruene.jpg"
        alt="Historic Gruene, New Braunfels, Texas"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            {propertyName}
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-4 font-light">
            Your Texas Hill Country Escape
          </p>
          <p className="text-lg md:text-xl mb-8 text-gray-200">
            {city}, {state}
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 bg-white text-gray-900 hover:bg-gray-100"
            onClick={onBookingClick}
          >
            Check Availability
          </Button>
        </div>
      </div>
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  )
}
