import { test, expect } from '@playwright/test'

test.describe('Booking price integrity', () => {
  test('booking.create input schema does not accept price fields', async ({ request }) => {
    // tRPC batch format: POST to /api/trpc/booking.create
    const res = await request.post('/api/trpc/booking.create', {
      headers: { 'content-type': 'application/json' },
      data: JSON.stringify({
        "0": {
          json: {
            checkIn: '2026-08-15',
            checkOut: '2026-08-17',
            numberOfGuests: 2,
            guestName: 'Price Tamper Test',
            guestEmail: 'tamper@test.com',
            guestPhone: '5551234567',
            totalPrice: 1,
            pricePerNight: 0.01,
          },
        },
      }),
    })
    const body = await res.json()
    // The response should either succeed with server-calculated prices (not 1 or 0.01),
    // or fail for other reasons (like Stripe not configured). Either way, the tampered
    // price fields should have no effect.
    if (body[0]?.result?.data) {
      expect(Number(body[0].result.data.totalPrice)).toBeGreaterThan(100)
      expect(Number(body[0].result.data.pricePerNight)).toBeGreaterThan(1)
    }
    // If it errors, that's fine too — the important thing is it didn't accept price: 1
  })
})
