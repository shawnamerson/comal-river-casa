import Link from 'next/link'
import Image from 'next/image'
import { GuidebookEmailCapture } from '@/components/guidebook-email-capture'

export const metadata = {
  title: 'Local Guidebook — Comal River Casa',
  description:
    'Our favorite local spots in New Braunfels, TX — restaurants, bars, activities, shopping, and river tubing recommendations.',
}

interface Place {
  name: string
  description?: string
  suggestions?: string
  url?: string
  image?: string
}

interface Section {
  title: string
  emoji: string
  intro?: string
  places: Place[]
}

const sections: Section[] = [
  {
    title: 'Food Scene',
    emoji: '\uD83C\uDF7D\uFE0F',
    places: [
      {
        name: 'Huisache Grill',
        url: 'https://huisachegrill.com/',
        image: '/images/guidebook/huisache-grill.jpg',
        description:
          'Quaint restaurant perfect for an intimate evening. Exceptional food, wine, and beer. Their outdoor patio has a bar, fire pits, seating, and live music - serving up apps, wine and beer. The "Grassmarket" is adjacent to the restaurant with some great little shops! Tell Susie we sent y\'all!',
        suggestions:
          'Charcuterie Board (best in town!), Artichoke Dip, Soup and Salad Combo, Grilled Pork Sandwich, Parmesan Breaded Chicken Breast, Mix and Match, Mixed Grill, Hot and Crunchy Trout',
      },
      {
        name: "McAdoo's Seafood Company",
        url: 'https://www.mcadoos.com/',
        description:
          "Looking for seafood with a side of cajun? You're here! Brunch served as well.",
        suggestions:
          'Seafood Fondue, Rockefeller or Traditional Oysters, Almond Crusted Flounder, Mahi Mahi Boudreaux, Seafood Salad',
      },
      {
        name: "Krause's Cafe",
        url: 'https://krausescafe.com/',
        description:
          'A biergarten with a full bar and menu, outdoor seating, and live music, what more could you ask for?',
        suggestions:
          "Wild Game Sausage Sampler, Kartoffel Poppers, Krause's Reuben, Texas Schnitzel, Grilled Ribeye",
      },
      {
        name: "Myron's Prime Steakhouse",
        url: 'https://myronsprime.com/',
        description:
          'Cozy, classy, and private. Low lighting, food with amazing flavor, and a full bar. Shareable sides as 1 side can serve 2-3!',
        suggestions:
          "Surf & Turf, Steak, Shrimp Myron, Broccoli au Gratin, Jalapeno Mac & Cheese",
      },
      {
        name: 'Muck & Fuss',
        url: 'https://muckandfuss.com/',
        description:
          'Amazing selection of burgers! Indoor and outdoor seating. Get there before the crowd as it gets very busy!',
        suggestions:
          'Tempura Fried Shrimp, Jalapeno Cheese Fritters, Diablo, Spicy Juicy Lucy, Pour Over',
      },
      {
        name: "Calahan's Pub and Pizza",
        url: 'https://www.calahanspubandpizza.com/',
        description:
          'Relaxed vibe serving pizza, full bar, games, tvs, and outdoor seating.',
        suggestions:
          'Pizza Rolls, Housemade Cheese Bread, Chicken Pesto Pizza, Kitchen Sink',
      },
      {
        name: 'Downtown Social',
        url: 'https://www.downtownsocialnb.com/',
        image: '/images/guidebook/downtown-social.jpg',
        description:
          'Bring the family for bowling, games, food, drinks, and music! Under 21 allowed until 9pm.',
      },
      {
        name: "Cody's Restaurant, Bar, & Patio NB",
        url: 'https://www.codyssmtx.com/',
        image: '/images/guidebook/codys.jpg',
        description:
          'Perfect date night! Upscale dining. Everything on the menu is great!',
        suggestions:
          'Crab & Chorizo Arancini, Yellowfin Tuna Tartare, Bacon-Wrapped Poblano, Fried Brussels Sprouts, Bone-In Yorkshire Pork Chop (share this!), Beeman Ranch Wagyu Burger, Beef Wellington',
      },
      {
        name: 'Fork and Spoon',
        url: 'https://www.forkandspoontexas.com/',
        image: '/images/guidebook/fork-and-spoon.png',
        description: 'Great breakfast and lunch spot with mimosas!',
        suggestions:
          'Classic or Jillian Eggs Benedict, Mediterranean Salad, Turkey Bacon and Avocado, Grilled Chicken and Sun-dried Tomato Sandwich',
      },
      {
        name: 'La Cosecha Mexican Table',
        url: 'https://www.lacosechatx.com/',
        description:
          'Outdoor patio and bar with some great cocktails; we love this upscale Mexican restaurant and its vibe. Brunch served as well.',
        suggestions:
          'Brisket Queso, Shishito Peppers, Wagyu Steak Fajitas, Brisket or Cochinita Pibil Tacos, La Picadurra (cocktail)',
      },
      {
        name: 'Gristmill River Restaurant & Bar',
        url: 'https://gristmillrestaurant.com/',
        image: '/images/guidebook/gristmill.jpg',
        description:
          'The old cotton gin turned restaurant! Indoor and outdoor seating, great food and in Gruene, we just love this place!',
        suggestions:
          'Spicy Margarita, Onion Rings, Artichoke Dip, Ribs, Chicken Fried Chicken or Steak',
      },
      {
        name: "Mozie's",
        url: 'https://mozies.com/',
        description: 'Across from Gruene Hall!',
        suggestions:
          'Gruene Gimlet (cocktail), Shiner Bock Onion Rings, Lettuce Wedge, Sliders, Panko Parmesan Chicken, Smoked Turkey Sandwich',
      },
      {
        name: 'Gruene River Grill',
        url: 'https://www.gruenerivergrill.com/',
        description:
          'Down the road from Gruene Hall and such a cute and cozy place to dine!',
        suggestions:
          'Mexican Martini (cocktail), Shrimp Wontons, Artichoke Dip, Fried Artichokes, Jalapeno Crawfish Chowder, Fish Tacos, Chicken Guadalupe, Jalapeno Mandarin Pork Chops',
      },
      {
        name: "Otto's Cheese Shop",
        url: 'https://ottoscheeseshop.com/',
        image: '/images/guidebook/ottos-cheese.jpg',
        description:
          'Great place for meats and cheeses to make your charcuterie board!',
      },
      {
        name: 'Gourmage',
        url: 'https://www.gourmage.com/',
        description:
          'Great place for meats and cheeses to make your charcuterie board!',
      },
      {
        name: 'Bootleggers Pizza Parlor',
        url: 'https://bootleggerspizzaparlor.com/',
        description: 'Pizza! Games and playground for kids (and adults)!',
      },
    ],
  },
  {
    title: 'Bar Scene',
    emoji: '\uD83C\uDF7B',
    places: [
      {
        name: 'Pour Haus Patio Bar',
        url: 'https://www.pourhausnb.com/',
        description:
          'Outdoor bar with rooftop bar and live music. Under 21 allowed until 9pm.',
      },
      {
        name: 'Moonshine & Ale',
        url: 'https://moonshineale.com/',
        image: '/images/guidebook/moonshine-ale.jpg',
        description: 'Piano bar - make your requests!',
      },
      {
        name: 'The Oyster Bar',
        url: 'https://www.nboysterbar.com/',
        description:
          'Home of the signature "Breakfast Shot". Under 21 allowed until 9pm.',
        suggestions:
          'Hot Seafood Dip, Crab Dip, Fresh Oysters, Candied Bacon Sliders',
      },
      {
        name: 'Scores Sports Bar & Grill',
        url: 'https://www.scoresnbtx.com/',
        image: '/images/guidebook/scores.jpg',
        description: 'Serving food, too! Under 21 allowed until 9pm.',
        suggestions:
          'Firecracker Shrimp, anything fried, and their pizzas, too!',
      },
      {
        name: "Gruene Tini's",
        url: 'https://gruenetinis.com/',
        image: '/images/guidebook/gruene-tinis.jpg',
        description: 'Small martini bar, wide selection of martinis and beer.',
      },
      {
        name: 'Vino en Verde',
        url: 'http://www.getdrinkingingruene.com/',
        description:
          "Looking for the best espresso martini in town? You've found it!",
      },
      {
        name: 'Sidecar',
        url: 'https://sidecarnb.com/',
        description:
          'Great vibes with great crafty cocktails and live music. Be sure to make a reservation!',
      },
      {
        name: 'The Villa | Gruene, TX',
        url: 'https://www.drinklokal.com/',
        description:
          'Live music, trivia, and great drinks! Kid friendly until 8pm!',
      },
    ],
  },
  {
    title: 'Gruene',
    emoji: '\uD83C\uDFD8\uFE0F',
    intro:
      "We LOVE Gruene, it has so much to offer! Cash only in Gruene Hall. Head to Gruene Haus for cute tees and souvenirs, and tell the owner, Jackie, we sent y'all!",
    places: [],
  },
  {
    title: 'Kid-Friendly',
    emoji: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66',
    intro: 'These places have a play area or playscape:',
    places: [
      { name: "Herbert's", url: 'https://www.herbertstx.com/', image: '/images/guidebook/herberts.jpg' },
      { name: 'The Hideaway New Braunfels', url: 'https://hideaway-texas.com/' },
      { name: 'Iron Horse Bar & Grill', url: 'https://ironhorsegrillnbtx.com/' },
      { name: "Casa Garcia's - New Braunfels", url: 'https://www.casagarcias.com/' },
      { name: 'Guadalupe Brewing Company & Pizza Kitchen', url: 'https://www.guadalupebrew.com/', image: '/images/guidebook/guadalupe-brewing.png' },
      {
        name: 'Freiheit Country Store',
        url: 'https://www.freiheitcountrystore.net/',
        description:
          'Amazing people, homestyle cooking, full bar, and live music! Freiheit is a staple in this town.',
      },
      { name: 'The Longhorn Cafe', url: 'https://www.thelonghorncafe.com/' },
      { name: 'Tin Top Burger Shop', url: 'https://tintopburgers.com/' },
      { name: "Willie's Grill & Icehouse", url: 'https://williesgrillandicehouse.com/' },
    ],
  },
  {
    title: 'Attractions',
    emoji: '\uD83C\uDFA2',
    places: [
      { name: 'Schlitterbahn Waterpark & Resort', url: 'https://www.schlitterbahn.com/new-braunfels/', image: '/images/guidebook/schlitterbahn.jpg' },
      { name: 'The Float In', url: 'https://floatintx.com/' },
      {
        name: 'Gruene Hall',
        url: 'https://gruenehall.com/',
        description: 'What else is there to say?! CASH ONLY!',
      },
    ],
  },
  {
    title: 'Shopping',
    emoji: '\uD83D\uDECD\uFE0F',
    places: [
      {
        name: 'Princess Be',
        url: 'https://www.facebook.com/princessbeboutique/',
        description:
          'Kids, women, accessories, and the best candles ever!',
      },
      { name: 'Boutique Chloe Rose', url: 'https://www.boutiquechloerose.com/' },
      { name: 'River Rose', url: 'https://www.shopriverrose.com/' },
      { name: 'The Local', url: 'https://www.thelocaltx.com/' },
      { name: 'Lot 59', url: 'https://www.facebook.com/lot59/' },
      { name: 'Alibi Boutique', url: 'https://www.facebook.com/alibiboutiquenb/' },
      {
        name: "Ducky's Swimwear & T-shirts",
        url: 'https://duckysswim.com/',
        description: 'Get your summer gear here!',
      },
    ],
  },
  {
    title: 'Comal River Tubing',
    emoji: '\uD83D\uDEDF',
    places: [
      {
        name: 'Texas Tubes',
        url: 'https://www.texastubes.com/',
        image: '/images/guidebook/texas-tubes.jpg',
        description: 'This is a local spot, shhhh! Shuttle and tube rentals!',
      },
      { name: "Felger's River Center & Toob Rental", url: 'https://www.facebook.com/FelgersRiverCenter/' },
      {
        name: 'Landa Falls',
        url: 'https://landafalls.com/',
        image: '/images/guidebook/landa-falls.jpg',
        description: 'Longest float for the Comal!',
      },
      { name: 'Corner Tubes', url: 'https://cornertubes.com/' },
    ],
  },
]

function PlaceCard({ place }: { place: Place }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {place.image && (
        <div className="relative h-48 w-full">
          <Image
            src={place.image}
            alt={place.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        {place.url ? (
          <a href={place.url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline">
            {place.name}
          </a>
        ) : (
          <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
        )}
        {place.description && (
          <p className="mt-2 text-gray-600 text-sm leading-relaxed">
            {place.description}
          </p>
        )}
        {place.suggestions && (
          <p className="mt-2 text-sm italic text-blue-700">
            Try: {place.suggestions}
          </p>
        )}
      </div>
    </div>
  )
}

export default function GuidebookPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        {/* Hero / Intro */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3">NB Local Spots</h1>
          <p className="text-lg text-gray-500">
            Our favorite places in New Braunfels — from Kody &amp; Dahlia
          </p>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <section key={section.title} className="mb-14">
            <h2 className="text-2xl font-semibold mb-2">
              {section.emoji} {section.title}
            </h2>

            {section.intro && (
              <p className="text-gray-600 mb-4">{section.intro}</p>
            )}

            {section.places.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.places.map((place) => (
                  <PlaceCard key={place.name} place={place} />
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Email Capture CTA */}
        <GuidebookEmailCapture />

        {/* Footer note */}
        <p className="text-sm text-gray-500 text-center mt-16">
          Know a spot we&apos;re missing? Let us know at{' '}
          <a
            href="mailto:kodybyron@yahoo.com"
            className="text-blue-600 hover:underline"
          >
            kodybyron@yahoo.com
          </a>
        </p>
      </div>
    </main>
  )
}
