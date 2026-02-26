import Link from 'next/link'
import { PROPERTY } from '@/config/property'

export const metadata = {
  title: 'House Rules',
  description:
    'House rules and guest guidelines for Comal River Casa vacation rental in New Braunfels, TX.',
}

export default function HouseRulesPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">House Rules</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Check-in &amp; Check-out</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Check-in: after {PROPERTY.checkInTime}</li>
            <li>Check-out: by {PROPERTY.checkOutTime}</li>
            <li>Early check-in or late check-out is not guaranteed and must be arranged in advance.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Occupancy</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Maximum of {PROPERTY.maxGuests} guests (including children).</li>
            <li>Only registered guests are allowed to stay overnight.</li>
            <li>Any visitors must leave by 10:00 PM.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Noise &amp; Quiet Hours</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Quiet hours are from 10:00 PM to 8:00 AM.</li>
            <li>Please be respectful of neighbors at all times.</li>
            <li>No parties or events are permitted.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Smoking</h2>
          <p className="text-gray-700">
            Smoking (including e-cigarettes and vaporizers) is strictly
            prohibited inside the property. Smoking is permitted on the patio
            area only. A cleaning fee of $250 will be charged if evidence of
            indoor smoking is found.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pets</h2>
          <p className="text-gray-700">
            Pets are not allowed on the property. Service animals are welcome
            with advance notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pool &amp; Hot Tub</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Use the pool and hot tub at your own risk. No lifeguard is on duty.</li>
            <li>Children must be supervised by an adult at all times.</li>
            <li>No glass containers in the pool or hot tub area.</li>
            <li>Please shower before entering the hot tub.</li>
            <li>Pool and hot tub hours are subject to community rules.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Damages &amp; Liability</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              Guests are responsible for any damage to the property or its
              contents during their stay.
            </li>
            <li>
              Please report any damage or maintenance issues immediately.
            </li>
            <li>
              Charges for damages will be assessed after checkout and billed to
              the payment method on file.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">General</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Please lock all doors and windows when leaving the property.</li>
            <li>Dispose of trash in the designated bins before checkout.</li>
            <li>Do not remove any furnishings, linens, or supplies from the property.</li>
            <li>Illegal activities of any kind are strictly prohibited.</li>
          </ul>
        </section>

        <p className="text-sm text-gray-500">
          Failure to comply with these rules may result in immediate eviction
          without refund. Questions? Email us at{' '}
          <a href="mailto:kodybyron@yahoo.com" className="text-blue-600 hover:underline">kodybyron@yahoo.com</a>.
        </p>
      </div>
    </main>
  )
}
