import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { NextRequest } from 'next/server'

const { constructEvent, refundsCreate, bookingFindUnique, bookingUpdate, emailsSend } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  refundsCreate: vi.fn(),
  bookingFindUnique: vi.fn(),
  bookingUpdate: vi.fn(),
  emailsSend: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: { constructEvent },
    refunds: { create: refundsCreate },
  },
}))

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    booking: { findUnique: bookingFindUnique, update: bookingUpdate },
    damageCharge: { updateMany: vi.fn() },
  },
}))

vi.mock('@/lib/resend', () => ({
  resend: { emails: { send: emailsSend } },
}))

import { POST } from '@/app/api/webhooks/stripe/route'

function fakeRequest(body: string): NextRequest {
  return {
    text: async () => body,
    headers: { get: (name: string) => (name === 'stripe-signature' ? 'sig' : null) },
  } as unknown as NextRequest
}

describe('stripe webhook: payment_intent.succeeded for an already-cancelled booking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    process.env.EMAIL_FROM = 'bookings@example.com'
    process.env.ADMIN_EMAIL = 'admin@example.com'
  })

  it('does not resurrect the booking, refunds the charge, and alerts admin', async () => {
    const paymentIntent = {
      id: 'pi_test_123',
      metadata: { bookingId: 'booking_1' },
    }
    constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: paymentIntent },
    })
    bookingFindUnique.mockResolvedValue({
      id: 'booking_1',
      status: 'CANCELLED',
      paymentStatus: 'PENDING',
      guestName: 'Verify Test',
      guestEmail: 'test-verify@example.com',
      checkIn: new Date('2026-12-01T06:00:00.000Z'),
      checkOut: new Date('2026-12-05T06:00:00.000Z'),
    })
    refundsCreate.mockResolvedValue({ id: 're_test_123' })
    emailsSend.mockResolvedValue({ data: {}, error: null })

    const res = await POST(fakeRequest('{}'))

    expect(res.status).toBe(200)
    // Must NOT flip the booking back to CONFIRMED.
    expect(bookingUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'CONFIRMED' }) })
    )
    // Must refund the live charge instead.
    expect(refundsCreate).toHaveBeenCalledWith({ payment_intent: 'pi_test_123' })
    expect(bookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking_1' },
        data: { paymentStatus: 'REFUNDED' },
      })
    )
    // Must alert the admin.
    expect(emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin@example.com', subject: expect.stringContaining('Action needed') })
    )
  })

  it('still confirms a booking that is genuinely pending (control case)', async () => {
    const paymentIntent = {
      id: 'pi_test_456',
      metadata: { bookingId: 'booking_2' },
    }
    constructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: paymentIntent },
    })
    bookingFindUnique.mockResolvedValue({
      id: 'booking_2',
      status: 'PENDING',
      paymentStatus: 'PENDING',
      guestName: 'Verify Test',
      guestEmail: 'test-verify@example.com',
      checkIn: new Date('2026-12-01T06:00:00.000Z'),
      checkOut: new Date('2026-12-05T06:00:00.000Z'),
    })
    bookingUpdate.mockResolvedValue({
      id: 'booking_2',
      guestName: 'Verify Test',
      guestEmail: 'test-verify@example.com',
      checkIn: new Date('2026-12-01T06:00:00.000Z'),
      checkOut: new Date('2026-12-05T06:00:00.000Z'),
      numberOfNights: 4,
      numberOfGuests: 2,
      pricePerNight: 194.5,
      cleaningFee: 145,
      taxBreakdown: null,
      totalPrice: 985.24,
      specialRequests: null,
    })
    emailsSend.mockResolvedValue({ data: {}, error: null })

    const res = await POST(fakeRequest('{}'))

    expect(res.status).toBe(200)
    expect(refundsCreate).not.toHaveBeenCalled()
    expect(bookingUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'booking_2' },
        data: { status: 'CONFIRMED', paymentStatus: 'SUCCEEDED' },
      })
    )
  })
})
