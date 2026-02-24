import Image from 'next/image'
import type { PROPERTY } from '@/config/property'

interface HomeBaseSectionProps {
  property: typeof PROPERTY
}

export function HomeBaseSection({ property }: HomeBaseSectionProps) {
  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Perfect Home Base
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            After a day of adventure, retreat to your riverside haven with stunning views and modern comforts
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={property.images[1].url}
              alt={property.images[1].altText}
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-xl md:text-3xl font-bold text-gray-900 text-center md:whitespace-nowrap">
              Your Hill Country Haven Awaits
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              {property.description}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Whether you&apos;re seeking adventure on the crystal-clear Comal River or a peaceful escape
              under the Texas stars, our casa offers the perfect blend of comfort and natural beauty.
              Wake up to stunning views, spend your days floating down the river, and end each evening
              on the patio watching the sunset paint the Hill Country sky.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">
              Comfort Meets Luxury
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Step inside to discover a beautifully appointed space designed for both relaxation and
              entertainment. Our open-concept living area flows seamlessly from the gourmet kitchen to
              the inviting living room, perfect for gathering with family and friends.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Every detail has been carefully considered to ensure your stay is nothing short of
              exceptional. From premium bedding to modern appliances, we&apos;ve thought of everything
              so you don&apos;t have to.
            </p>
          </div>
          <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
            <Image
              src={property.images[2].url}
              alt={property.images[2].altText}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
