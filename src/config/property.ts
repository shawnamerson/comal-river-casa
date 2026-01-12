// Hardcoded property information for Comal River Casa
export const PROPERTY = {
  name: 'Comal River Casa',
  city: 'New Braunfels',
  state: 'TX',
  description: `Experience the perfect riverside getaway at Comal River Casa. This beautifully appointed condo offers stunning river views, modern amenities, and direct access to the crystal-clear waters of the Comal River.

Our space features comfortable accommodations with a fully equipped kitchen, spacious living areas, and a private balcony overlooking the river. Whether you're looking to tube down the river, explore nearby attractions, or simply relax and enjoy the natural beauty, Comal River Casa is your ideal home base.

Perfect for families, couples, or groups of friends seeking a memorable Texas Hill Country experience.`,

  bedrooms: 2,
  bathrooms: 2,
  maxGuests: 6,
  squareFeet: 1200,

  // Pricing
  basePrice: 200,
  cleaningFee: 75,

  // Booking Rules
  minNights: 2,
  maxNights: 14,
  checkInTime: '16:00',
  checkOutTime: '11:00',

  // Property Images
  images: [
    {
      url: '/images/property/main.jpg',
      altText: 'Comal River Casa - Main View',
    },
    {
      url: '/images/property/river_view.jpg',
      altText: 'Beautiful River View',
    },
    {
      url: '/images/property/living_dining.jpg',
      altText: 'Living and Dining Area',
    },
    {
      url: '/images/property/kitchen.jpg',
      altText: 'Fully Equipped Kitchen',
    },
    {
      url: '/images/property/master_bedroom.jpg',
      altText: 'Master Bedroom',
    },
    {
      url: '/images/property/master_bath.jpg',
      altText: 'Master Bathroom',
    },
    {
      url: '/images/property/guest_bedroom.jpg',
      altText: 'Guest Bedroom',
    },
    {
      url: '/images/property/guest_bathroom.jpg',
      altText: 'Guest Bathroom',
    },
    {
      url: '/images/property/hot_tub.jpg',
      altText: 'Hot Tub',
    },
    {
      url: '/images/property/pool.jpg',
      altText: 'Community Pool',
    },
    {
      url: '/images/property/patio.jpg',
      altText: 'Patio Area',
    },
    {
      url: '/images/property/river_access.jpg',
      altText: 'Direct River Access',
    },
    {
      url: '/images/property/dining.jpg',
      altText: 'Dining Area',
    },
    {
      url: '/images/property/mini_bar.jpg',
      altText: 'Mini Bar',
    },
    {
      url: '/images/property/condo_entrance.jpg',
      altText: 'Condo Entrance',
    },
    {
      url: '/images/property/parking.jpg',
      altText: 'Parking Area',
    },
  ],

  // Amenities
  amenities: [
    'WiFi',
    'Air Conditioning',
    'Heating',
    'Full Kitchen',
    'Free Parking',
    'TV with Cable',
    'Washer/Dryer',
    'Balcony',
    'River Access',
    'Near Downtown',
    'Smoke Detector',
    'First Aid Kit',
    'Fire Extinguisher',
  ],

  // Sample Reviews - You can manage these here or keep in database
  reviews: [
    {
      id: '1',
      guestName: 'Test Guest',
      rating: 5,
      comment: 'Amazing stay! The river view was breathtaking and the condo had everything we needed. Perfect location for tubing and exploring New Braunfels. Highly recommend!',
      date: new Date('2026-01-05'),
    },
  ],
} as const
