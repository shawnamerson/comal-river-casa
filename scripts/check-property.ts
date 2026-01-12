import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProperty() {
  const properties = await prisma.property.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      isActive: true,
    }
  })

  console.log('All properties in database:')
  console.log(JSON.stringify(properties, null, 2))

  const specificProperty = await prisma.property.findFirst({
    where: {
      slug: 'comal-river-casa',
      isActive: true,
    }
  })

  console.log('\nSearching for slug "comal-river-casa" with isActive=true:')
  console.log(specificProperty ? 'Found!' : 'Not found')

  await prisma.$disconnect()
}

checkProperty()
