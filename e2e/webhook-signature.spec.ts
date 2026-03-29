import { test, expect } from '@playwright/test'

test.describe('Stripe webhook security', () => {
  test('rejects request with no signature', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: JSON.stringify({ type: 'payment_intent.succeeded', data: {} }),
      headers: { 'content-type': 'application/json' },
    })
    expect(res.status()).toBe(400)
  })

  test('rejects request with invalid signature', async ({ request }) => {
    const res = await request.post('/api/webhooks/stripe', {
      data: JSON.stringify({ type: 'payment_intent.succeeded', data: {} }),
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 't=1234,v1=fakesig',
      },
    })
    expect(res.status()).toBe(400)
  })
})
