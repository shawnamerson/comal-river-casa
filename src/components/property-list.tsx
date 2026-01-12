'use client'

import { trpc } from '@/lib/trpc/client'
import { PropertyCard } from './property-card'

export function PropertyList() {
  const { data: properties, isLoading, error } = trpc.property.list.useQuery({ limit: 10 })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading properties: {error.message}</p>
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">No properties available at the moment.</p>
        <p className="text-gray-500 text-sm mt-2">Check back soon for new listings!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          id={property.id}
          name={property.name}
          slug={property.slug}
          description={property.description}
          city={property.city}
          state={property.state}
          bedrooms={property.bedrooms}
          bathrooms={Number(property.bathrooms)}
          maxGuests={property.maxGuests}
          basePrice={Number(property.basePrice)}
          images={property.images}
        />
      ))}
    </div>
  )
}
