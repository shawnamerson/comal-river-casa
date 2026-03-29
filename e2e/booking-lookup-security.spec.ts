import { test, expect } from '@playwright/test'

test.describe('Booking lookup security', () => {
  test('returns not found for invalid booking ID', async ({ request }) => {
    const res = await request.post('/api/trpc/booking.lookup', {
      headers: { 'content-type': 'application/json' },
      data: JSON.stringify({
        "0": {
          json: {
            bookingId: 'nonexistent-id',
            email: 'nobody@example.com',
          },
        },
      }),
    })
    const body = await res.json()
    // Should return a NOT_FOUND error, not leak any data
    expect(body[0]?.error?.data?.code).toBe('NOT_FOUND')
  })

  test('rate limits after too many failed attempts', async ({ request }) => {
    const statuses: number[] = []
    // Fire rapid requests exceeding the rate limit (5 per 5 min)
    for (let i = 0; i < 8; i++) {
      const res = await request.post('/api/trpc/booking.lookup', {
        headers: { 'content-type': 'application/json' },
        data: JSON.stringify({
          "0": {
            json: {
              bookingId: `fake-id-${i}`,
              email: 'attacker@example.com',
            },
          },
        }),
      })
      statuses.push(res.status())
    }
    // At least one response should be rate limited (429)
    expect(statuses).toContain(429)
  })
})
