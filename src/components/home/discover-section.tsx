import Image from 'next/image'

export function DiscoverSection() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Discover New Braunfels
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Where Texas Hill Country charm meets endless adventure on the crystal-clear waters of the Comal River
          </p>
        </div>

        {/* River Tubing - Image Left */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/property/tubing.jpg"
              alt="Comal River Tubing"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">River Tubing Paradise</h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Float down the pristine Comal River, one of the shortest and most beautiful rivers in Texas.
              Crystal-clear spring-fed waters maintain a perfect 72&deg;F year-round. Tube chutes, rope swings,
              and lazy river sections create the ultimate tubing experience.
            </p>
          </div>
        </div>

        {/* Schlitterbahn - Image Right */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6 order-2 md:order-1">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">Schlitterbahn Waterpark</h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Home to America&apos;s #1 rated waterpark! Experience thrilling water slides, the world&apos;s
              first uphill water coaster, lazy rivers, and family-friendly attractions. Just minutes from
              your door to endless summer fun.
            </p>
          </div>
          <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
            <Image
              src="/images/property/Schlitterbahn_waterpark.jpg"
              alt="Schlitterbahn Waterpark"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Hill Country Culture - Image Left */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/property/wurst.jpg"
              alt="German Wurstfest Culture"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">Texas Hill Country Culture</h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Savor authentic Texas BBQ, explore German heritage in historic Gruene, browse local wineries
              and breweries, and discover live music venues. Shop antique stores, artisan boutiques, and
              the famous Gruene Hall, Texas&apos; oldest dance hall.
            </p>
          </div>
        </div>

        {/* Natural Wonders - Image Right */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-6 order-2 md:order-1">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">Natural Wonders</h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left mb-4">
              Explore Natural Bridge Caverns, one of the largest underground cave systems in Texas.
              Hike scenic trails through Hill Country landscapes, discover hidden swimming holes,
              and witness spectacular sunsets over rolling hills.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Landa Park offers 51 acres of spring-fed swimming, miniature golf, paddleboats,
              and shaded picnic areas perfect for family outings.
            </p>
          </div>
          <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl order-1 md:order-2">
            <Image
              src="/images/property/natural-bridge-caverns.jpg"
              alt="Natural Bridge Caverns"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Entertainment - Image Left */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 md:h-[450px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/images/property/live-music.jpg"
              alt="Live Music and Entertainment"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center md:text-left">Entertainment & Events</h3>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left mb-4">
              Experience live music at historic Gruene Hall where legends like Willie Nelson have played.
              Enjoy seasonal festivals celebrating German heritage, wine country tours through nearby
              vineyards, and vibrant downtown nightlife.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed text-center md:text-left">
              Year-round events include Wurstfest, Christmas markets, and outdoor concerts under
              the Texas stars.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
