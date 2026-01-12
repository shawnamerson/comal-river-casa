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

  // Create property
  const property = await prisma.property.upsert({
    where: { slug: 'comal-river-casa' },
    update: {},
    create: {
      name: 'Comal River Casa',
      slug: 'comal-river-casa',
      description: `Experience the perfect riverside getaway at Comal River Casa. This beautifully appointed condo offers stunning river views, modern amenities, and direct access to the crystal-clear waters of the Comal River.

Our space features comfortable accommodations with a fully equipped kitchen, spacious living areas, and a private balcony overlooking the river. Whether you're looking to tube down the river, explore nearby attractions, or simply relax and enjoy the natural beauty, Comal River Casa is your ideal home base.

Perfect for families, couples, or groups of friends seeking a memorable Texas Hill Country experience.`,
      address: '123 River Road',
      city: 'New Braunfels',
      state: 'TX',
      zipCode: '78130',
      country: 'USA',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 6,
      squareFeet: 1200,
      basePrice: 200,
      cleaningFee: 75,
      serviceFee: 0,
      minNights: 2,
      maxNights: 14,
      checkInTime: '16:00',
      checkOutTime: '11:00',
      isActive: true,
    },
  })
  console.log('Created property:', property.name)

  // Add property images
  const images = [
    {
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
      altText: 'Living room with river view',
      order: 0,
    },
    {
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      altText: 'Modern kitchen',
      order: 1,
    },
    {
      url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457',
      altText: 'Master bedroom',
      order: 2,
    },
    {
      url: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3',
      altText: 'Bathroom',
      order: 3,
    },
    {
      url: 'https://images.unsplash.com/photo-1507038772120-7fff76f79d79',
      altText: 'River view from balcony',
      order: 4,
    },
  ]

  for (const image of images) {
    await prisma.propertyImage.create({
      data: {
        ...image,
        propertyId: property.id,
      },
    })
  }
  console.log(`Created ${images.length} property images`)

  // Add amenities
  const amenities = [
    { name: 'WiFi', icon: 'wifi', category: 'ESSENTIAL' },
    { name: 'Air Conditioning', icon: 'air-vent', category: 'ESSENTIAL' },
    { name: 'Heating', icon: 'thermometer', category: 'ESSENTIAL' },
    { name: 'Kitchen', icon: 'chef-hat', category: 'ESSENTIAL' },
    { name: 'Free Parking', icon: 'car', category: 'ESSENTIAL' },
    { name: 'TV with Cable', icon: 'tv', category: 'FEATURES' },
    { name: 'Washer/Dryer', icon: 'washing-machine', category: 'FEATURES' },
    { name: 'Balcony', icon: 'home', category: 'FEATURES' },
    { name: 'River Access', icon: 'waves', category: 'LOCATION' },
    { name: 'Near Downtown', icon: 'map-pin', category: 'LOCATION' },
    { name: 'Smoke Detector', icon: 'bell', category: 'SAFETY' },
    { name: 'First Aid Kit', icon: 'heart-pulse', category: 'SAFETY' },
    { name: 'Fire Extinguisher', icon: 'flame', category: 'SAFETY' },
  ]

  for (const amenity of amenities) {
    await prisma.propertyAmenity.create({
      data: {
        ...amenity,
        propertyId: property.id,
      },
    })
  }
  console.log(`Created ${amenities.length} amenities`)

  // Add seasonal pricing (Summer peak season)
  const summerPricing = await prisma.seasonalPrice.create({
    data: {
      propertyId: property.id,
      name: 'Summer Peak Season',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
      pricePerNight: 250,
    },
  })
  console.log('Created seasonal pricing:', summerPricing.name)

  // Add holiday pricing
  const holidayPricing = await prisma.seasonalPrice.create({
    data: {
      propertyId: property.id,
      name: 'Holiday Season',
      startDate: new Date('2026-12-20'),
      endDate: new Date('2027-01-05'),
      pricePerNight: 300,
    },
  })
  console.log('Created seasonal pricing:', holidayPricing.name)

  // Create a test guest user
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

  // Create a completed booking with a review
  const pastBooking = await prisma.booking.create({
    data: {
      propertyId: property.id,
      userId: guest.id,
      checkIn: new Date('2026-01-01'),
      checkOut: new Date('2026-01-05'),
      numberOfGuests: 4,
      guestName: 'Test Guest',
      guestEmail: 'guest@example.com',
      guestPhone: '555-1234',
      numberOfNights: 4,
      pricePerNight: 200,
      subtotal: 800,
      cleaningFee: 75,
      serviceFee: 87.50,
      totalPrice: 962.50,
      status: 'COMPLETED',
      paymentStatus: 'SUCCEEDED',
      stripePaymentIntentId: 'pi_test_123',
      stripeSessionId: 'cs_test_123',
    },
  })
  console.log('Created past booking')

  // Add review for the past booking
  const review = await prisma.review.create({
    data: {
      bookingId: pastBooking.id,
      propertyId: property.id,
      userId: guest.id,
      overallRating: 5,
      cleanlinessRating: 5,
      accuracyRating: 5,
      checkInRating: 5,
      communicationRating: 5,
      locationRating: 5,
      valueRating: 4,
      comment: 'Amazing stay! The river view was breathtaking and the condo had everything we needed. Perfect location for tubing and exploring New Braunfels. Highly recommend!',
      isPublished: true,
    },
  })
  console.log('Created review for past booking')

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
