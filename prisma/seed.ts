import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@comalrivercasa.com' },
    update: {},
    create: {
      email: 'admin@comalrivercasa.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })
  console.log('Created admin user:', admin.email)

  // Create test guest user
  const guestPassword = await bcrypt.hash('guest123', 10)
  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      name: 'Test Guest',
      password: guestPassword,
      role: 'GUEST',
      emailVerified: new Date(),
    },
  })
  console.log('Created test guest user:', guest.email)

  // Add seasonal rates (Summer peak season)
  const summerRate = await prisma.seasonalRate.upsert({
    where: { id: 'summer-2026' },
    update: {},
    create: {
      id: 'summer-2026',
      name: 'Summer Peak Season',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
      pricePerNight: 250,
    },
  })
  console.log('Created seasonal rate:', summerRate.name)

  // Add holiday pricing
  const holidayRate = await prisma.seasonalRate.upsert({
    where: { id: 'holiday-2026' },
    update: {},
    create: {
      id: 'holiday-2026',
      name: 'Holiday Season',
      startDate: new Date('2026-12-20'),
      endDate: new Date('2027-01-05'),
      pricePerNight: 300,
      minNights: 3,
    },
  })
  console.log('Created seasonal rate:', holidayRate.name)

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
