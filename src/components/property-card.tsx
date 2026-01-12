import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

export function PropertyCard({
  id,
  name,
  slug,
  description,
  city,
  state,
  bedrooms,
  bathrooms,
  maxGuests,
  basePrice,
  images,
}: PropertyCardProps) {
  const primaryImage = images[0]?.url || '/placeholder-property.jpg'
  const imageAlt = images[0]?.altText || name

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/properties/${slug}`}>
        <div className="relative h-64 w-full">
          <Image
            src={primaryImage}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Link href={`/properties/${slug}`}>
          <h3 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mb-2">
          {city}, {state}
        </p>
        <p className="text-gray-700 text-sm line-clamp-2 mb-4">{description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{bedrooms} bed{bedrooms !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{bathrooms} bath{bathrooms !== 1 ? 's' : ''}</span>
          <span>•</span>
          <span>{maxGuests} guest{maxGuests !== 1 ? 's' : ''}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold">${basePrice.toString()}</span>
          <span className="text-gray-600 text-sm"> / night</span>
        </div>
        <Link href={`/properties/${slug}`}>
          <Button>View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
