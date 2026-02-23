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

  // Date rate overrides are managed via the admin UI — no seed data needed
  console.log('Skipping date rate overrides (managed via admin UI)')

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
