import { describe, it, expect, vi } from 'vitest'

// Mock external services that throw on import without env vars
vi.mock('@/lib/stripe', () => ({
  stripe: {
    refunds: { create: vi.fn() },
    paymentIntents: { create: vi.fn(), retrieve: vi.fn() },
    customers: { create: vi.fn() },
    paymentMethods: { list: vi.fn() },
  },
}))

vi.mock('@/lib/resend', () => ({
  resend: {
    emails: { send: vi.fn().mockResolvedValue({ error: null }) },
  },
}))

// Mock Prisma responses
function createMockPrisma({
  settings = null as any,
  overrides = [] as any[],
  taxRates = [] as any[],
} = {}) {
  return {
    propertySettings: {
      findUnique: vi.fn().mockResolvedValue(settings),
    },
    dateRateOverride: {
      findMany: vi.fn().mockResolvedValue(overrides),
    },
    taxRate: {
      findMany: vi.fn().mockResolvedValue(taxRates),
    },
    booking: {
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    blockedDate: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  }
}

// Import and create a caller for the booking router
import { bookingRouter } from '@/server/routers/booking'

function createCaller(prisma: any) {
  return bookingRouter.createCaller({ prisma, session: null })
}

describe('calculatePrice', () => {
  it('calculates base price for a 3-night stay with no overrides', async () => {
    const prisma = createMockPrisma({
      settings: {
        basePrice: 200,
        cleaningFee: 75,
        minNights: 2,
        maxNights: 14,
      },
    })

    const caller = createCaller(prisma)
    const result = await caller.calculatePrice({
      checkIn: '2026-07-01',
      checkOut: '2026-07-04',
      numberOfGuests: 2,
    })

    expect(result.numberOfNights).toBe(3)
    expect(result.pricePerNight).toBe(200)
    expect(result.subtotal).toBe(600)
    expect(result.cleaningFee).toBe(75)
    expect(result.serviceFee).toBe(0)
    expect(result.taxTotal).toBe(0)
    expect(result.totalPrice).toBe(675)
    expect(result.minNights).toBe(2)
    expect(result.hasCustomRate).toBe(false)
  })

  it('applies date rate overrides for specific nights', async () => {
    const prisma = createMockPrisma({
      settings: {
        basePrice: 200,
        cleaningFee: 75,
        minNights: 2,
        maxNights: 14,
      },
      overrides: [
        {
          date: new Date('2026-07-03T00:00:00Z'),
          pricePerNight: 350,
          minNights: null,
        },
      ],
    })

    const caller = createCaller(prisma)
    const result = await caller.calculatePrice({
      checkIn: '2026-07-01',
      checkOut: '2026-07-04',
      numberOfGuests: 2,
    })

    // Night 1: Jul 1 = $200, Night 2: Jul 2 = $200, Night 3: Jul 3 = $350
    expect(result.numberOfNights).toBe(3)
    expect(result.subtotal).toBe(750)
    expect(result.pricePerNight).toBeCloseTo(250) // average
    expect(result.hasCustomRate).toBe(true)
    expect(result.totalPrice).toBe(825) // 750 + 75 cleaning
  })

  it('calculates taxes on subtotal', async () => {
    const prisma = createMockPrisma({
      settings: {
        basePrice: 100,
        cleaningFee: 50,
        minNights: 1,
        maxNights: 14,
      },
      taxRates: [
        { name: 'State Hotel Tax', rate: 0.06, isActive: true, sortOrder: 0 },
        { name: 'County Tax', rate: 0.02, isActive: true, sortOrder: 1 },
      ],
    })

    const caller = createCaller(prisma)
    const result = await caller.calculatePrice({
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      numberOfGuests: 2,
    })

    // 2 nights x $100 = $200 subtotal
    // State tax: $200 * 0.06 = $12
    // County tax: $200 * 0.02 = $4
    expect(result.subtotal).toBe(200)
    expect(result.taxBreakdown).toHaveLength(2)
    expect(result.taxBreakdown[0]).toEqual({ name: 'State Hotel Tax', rate: 0.06, amount: 12 })
    expect(result.taxBreakdown[1]).toEqual({ name: 'County Tax', rate: 0.02, amount: 4 })
    expect(result.taxTotal).toBe(16)
    expect(result.totalPrice).toBe(266) // 200 + 50 cleaning + 16 tax
  })

  it('uses fallback config when no DB settings exist', async () => {
    const prisma = createMockPrisma({
      settings: null, // no DB settings
    })

    const caller = createCaller(prisma)
    const result = await caller.calculatePrice({
      checkIn: '2026-07-01',
      checkOut: '2026-07-03',
      numberOfGuests: 2,
    })

    // Falls back to PROPERTY config: basePrice=200, cleaningFee=75, minNights=2
    expect(result.numberOfNights).toBe(2)
    expect(result.pricePerNight).toBe(200)
    expect(result.subtotal).toBe(400)
    expect(result.cleaningFee).toBe(75)
    expect(result.totalPrice).toBe(475)
    expect(result.minNights).toBe(2)
  })

  it('enforces per-date minimum nights', async () => {
    const prisma = createMockPrisma({
      settings: {
        basePrice: 200,
        cleaningFee: 75,
        minNights: 2,
        maxNights: 14,
      },
      overrides: [
        {
          date: new Date('2026-07-04T00:00:00Z'),
          pricePerNight: null,
          minNights: 5,
        },
      ],
    })

    const caller = createCaller(prisma)
    const result = await caller.calculatePrice({
      checkIn: '2026-07-01',
      checkOut: '2026-07-06',
      numberOfGuests: 2,
    })

    // The override sets minNights=5 for Jul 4, which is the max
    expect(result.minNights).toBe(5)
  })

  it('rejects stays exceeding max nights', async () => {
    const prisma = createMockPrisma({
      settings: {
        basePrice: 200,
        cleaningFee: 75,
        minNights: 2,
        maxNights: 3,
      },
    })

    const caller = createCaller(prisma)
    await expect(
      caller.calculatePrice({
        checkIn: '2026-07-01',
        checkOut: '2026-07-06', // 5 nights, max is 3
        numberOfGuests: 2,
      })
    ).rejects.toThrow('Maximum stay is 3 nights')
  })

  it('rejects bookings more than 12 months in advance', async () => {
    const prisma = createMockPrisma({
      settings: {
        basePrice: 200,
        cleaningFee: 75,
        minNights: 2,
        maxNights: 14,
      },
    })

    const caller = createCaller(prisma)
    const farFuture = new Date()
    farFuture.setFullYear(farFuture.getFullYear() + 2)
    const farFutureEnd = new Date(farFuture)
    farFutureEnd.setDate(farFutureEnd.getDate() + 3)

    await expect(
      caller.calculatePrice({
        checkIn: farFuture.toISOString(),
        checkOut: farFutureEnd.toISOString(),
        numberOfGuests: 2,
      })
    ).rejects.toThrow('12 months in advance')
  })
})
