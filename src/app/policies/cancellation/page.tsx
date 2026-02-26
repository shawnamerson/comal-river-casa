import Link from 'next/link'

export const metadata = {
  title: 'Cancellation Policy',
  description:
    'Cancellation and refund policy for Comal River Casa vacation rental in New Braunfels, TX.',
}

export default function CancellationPolicyPage() {
  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm mb-8 inline-block"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Cancellation Policy</h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Refund Windows</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong>5 or more days before check-in:</strong> Full refund of
              the total booking amount.
            </li>
            <li>
              <strong>Within 5 days of check-in:</strong> 50% refund of
              the total booking amount.
            </li>
            <li>
              <strong>No-shows:</strong> No refund will be issued for no-shows.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How to Cancel</h2>
          <p className="text-gray-700 mb-4">
            You can cancel your booking at any time by visiting the{' '}
            <Link
              href="/manage-booking"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Manage My Booking
            </Link>{' '}
            page and entering your confirmation number and email address.
          </p>
          <p className="text-gray-700">
            Once a cancellation is processed, your refund (if eligible) will be
            returned to the original payment method within 5&ndash;10 business
            days.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Exceptions</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              In the event of a natural disaster, government-mandated travel
              restriction, or other extraordinary circumstance that makes the
              property uninhabitable, a full refund or rebooking will be offered
              at the host&apos;s discretion.
            </li>
            <li>
              Early departures are not eligible for partial refunds.
            </li>
            <li>
              Modifications to booking dates are subject to availability and may
              result in a price adjustment.
            </li>
          </ul>
        </section>

        <p className="text-sm text-gray-500">
          Questions about our cancellation policy? Email us at the address
          provided in your booking confirmation.
        </p>
      </div>
    </main>
  )
}
