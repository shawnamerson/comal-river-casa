import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Stay Across From Schlitterbahn | New Braunfels Condo Sleeps 8',
  description:
    'Condo directly across from Schlitterbahn New Braunfels. Walk to the park, come home for lunch and naps. Sleeps 8, 2 king beds, pool, hot tub, free tubes. Book direct.',
}

export default function SchlitterbahnLodgingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[380px]">
        <Image
          src="/images/property/schlitterbahn.jpg"
          alt="Schlitterbahn waterpark in New Braunfels, Texas, across from Comal River Casa"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-white/85">
            Comal River Casa
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Across the Street From Schlitterbahn
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            Our condo sits directly across from Schlitterbahn New Braunfels. Walk to the
            gates in the morning, skip the parking lines, and come home whenever the day
            calls for a break.
          </p>
        </div>
      </section>

      {/* How the day works */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            A park day, without the parking lot
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-gray-600">
            <p>
              Staying across the street changes the whole trip. Be at the gates when the
              park opens, ride the big slides before the lines build, then walk home for
              lunch, naps, and a reset in the air conditioning. Head back over for the
              afternoon session rested, and stay through the evening without a long drive
              waiting at the end of it.
            </p>
            <p>
              No shuttle schedules, no daily parking fees, no packing the car like a
              expedition. Your base camp is right there, all day.
            </p>
          </div>
        </div>
      </section>

      {/* Room for the crew */}
      <section className="bg-gray-50 px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">
            Room for the whole crew
          </h2>
          <div className="space-y-4 text-lg leading-relaxed text-gray-600">
            <p>
              The condo sleeps 8 in 2 bedrooms and 2 bathrooms: two king beds, a sleeper
              sofa, and an air mattress, with a full kitchen for breakfast before the
              park and easy dinners after. One flat price for the whole place, instead of
              two or three hotel rooms split down a hallway.
            </p>
          </div>
        </div>
      </section>

      {/* After the park */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-6 text-3xl font-bold text-gray-900">After the park</h2>
          <div className="space-y-4 text-lg leading-relaxed text-gray-600">
            <p>
              When the park day ends, the water at home is calmer: a resort-style pool and
              a hot tub with a waterfall, both steps from the front door. On a non-park
              day, grab the free tubes and head to the Comal River, with private river
              access steps away from the condo. Downtown New Braunfels and Gruene are
              minutes away for dinner.
            </p>
            <p>
              Planning the rest of the trip? Our{' '}
              <Link href="/guidebook" className="font-semibold text-blue-600 underline">
                New Braunfels local guide
              </Link>{' '}
              covers the restaurants, bars, and river outfitters we send our own guests
              to.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 px-4 py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How far is Comal River Casa from Schlitterbahn?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The condo is directly across the street from Schlitterbahn New Braunfels. Guests walk to the park gates, come home for lunch and naps, and skip daily parking fees and shuttle schedules.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How many people can stay near Schlitterbahn at Comal River Casa?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The condo sleeps 8 in 2 bedrooms and 2 bathrooms, with two king beds, a sleeper sofa, an air mattress, and a full kitchen, so families and groups can stay together in one place instead of splitting into hotel rooms.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is there to do near Schlitterbahn besides the waterpark?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'The condo has a resort-style pool and hot tub on site, private Comal River access steps away with free tubes included, and downtown New Braunfels and historic Gruene are minutes away for restaurants, shopping, and live music.',
                  },
                },
              ],
            }),
          }}
        />
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Schlitterbahn lodging questions
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                How far is the condo from Schlitterbahn?
              </h3>
              <p className="text-lg leading-relaxed text-gray-600">
                Directly across the street. Walk to the gates in the morning, come home
                for lunch and naps, and head back for the afternoon. No daily parking
                fees, no shuttle schedules.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                How many people can stay?
              </h3>
              <p className="text-lg leading-relaxed text-gray-600">
                The condo sleeps 8 in 2 bedrooms and 2 bathrooms, with two king beds, a
                sleeper sofa, an air mattress, and a full kitchen, so families and groups
                stay together in one place instead of splitting into hotel rooms.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                What else is there to do nearby?
              </h3>
              <p className="text-lg leading-relaxed text-gray-600">
                The pool and hot tub are on site, private Comal River access is steps
                away with free tubes included, and downtown New Braunfels and historic
                Gruene are minutes away for restaurants, shopping, and live music.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-16 text-center text-white">
        <div className="container mx-auto max-w-3xl">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Book direct and skip the fees
          </h2>
          <p className="mb-8 text-lg text-white/90">
            From $200/night with a 2-night minimum. Booking here on comalrivercasa.com
            skips the service fees the big platforms add.
          </p>
          <Link
            href="/booking"
            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
          >
            Check Availability
          </Link>
          <p className="mt-6 text-sm text-white/75">
            <Link href="/" className="underline">
              See the full condo, photos, and reviews
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
