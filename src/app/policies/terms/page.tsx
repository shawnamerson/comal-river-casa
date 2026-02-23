import Link from 'next/link'
import { PROPERTY } from '@/config/property'

export const metadata = {
  title: `Terms of Service — ${PROPERTY.name}`,
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Booking Agreement</h2>
          <p className="text-gray-700 mb-4">
            By completing a reservation at {PROPERTY.name}, you (&quot;Guest&quot;)
            enter into a binding rental agreement with the property owner
            (&quot;Host&quot;). This agreement is subject to these Terms of
            Service, the{' '}
            <Link
              href="/policies/house-rules"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              House Rules
            </Link>
            , and the{' '}
            <Link
              href="/policies/cancellation"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Cancellation Policy
            </Link>
            .
          </p>
          <p className="text-gray-700">
            The Guest agrees to pay the total booking amount, including nightly
            rates, cleaning fees, and applicable taxes, at the time of
            reservation. The Host reserves the right to cancel a booking and
            issue a full refund if the Guest violates these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Use of Property</h2>
          <p className="text-gray-700">
            The property is provided as a short-term vacation rental for
            residential use only. The Guest shall not use the property for
            commercial purposes, parties, events, or any unlawful activity. The
            Guest agrees to comply with all applicable local, state, and federal
            laws during their stay.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Liability &amp; Assumption of Risk</h2>
          <p className="text-gray-700 mb-4">
            The Host is not liable for any injury, loss, or damage to the
            Guest&apos;s person or property during their stay, including but not
            limited to injuries sustained while using the pool, hot tub, river
            access, or any other amenity.
          </p>
          <p className="text-gray-700">
            The Guest assumes all risk associated with the use of the property
            and its amenities. The Guest is responsible for supervising all
            members of their party, including children, at all times.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Property Damage</h2>
          <p className="text-gray-700 mb-4">
            The Guest is financially responsible for any damage to the property,
            its furnishings, appliances, or fixtures caused by the Guest or any
            member of their party during the stay.
          </p>
          <p className="text-gray-700">
            Damage charges will be assessed after checkout. The Host reserves the
            right to charge the Guest&apos;s payment method on file for the cost
            of repairs or replacements.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
          <p className="text-gray-700">
            The Guest agrees to indemnify and hold harmless the Host from any
            claims, damages, losses, or expenses arising from the Guest&apos;s
            use of the property or violation of these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
          <p className="text-gray-700">
            These Terms of Service shall be governed by and construed in
            accordance with the laws of the State of Texas, without regard to
            conflict of law principles. Any disputes arising under these terms
            shall be resolved in the courts of Comal County, Texas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="text-gray-700">
            The Host reserves the right to update these Terms of Service at any
            time. Changes will be effective immediately upon posting. The terms
            in effect at the time of your booking will govern your reservation.
          </p>
        </section>

        <p className="text-sm text-gray-500">
          Questions about our terms? Email us at the address provided in your
          booking confirmation.
        </p>
      </div>
    </main>
  )
}
