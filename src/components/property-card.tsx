// This component is not used in the single-property site
// Property details are hardcoded in src/config/property.ts

import { Card, CardContent } from '@/components/ui/card'

interface PropertyCardProps {
  id: string
  name: string
  slug: string
  description: string
  city: string
  state: string
  bedrooms: number
  bathrooms: number
  maxGuests: number
  basePrice: number
  images: { url: string; altText: string | null }[]
}

export function PropertyCard(props: PropertyCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">
          This component is not used. See src/app/page.tsx for the property display.
        </p>
      </CardContent>
    </Card>
  )
}
