import { PROPERTY } from '@/config/property'

// This script displays the hardcoded property configuration
// Property details are no longer stored in the database

function checkProperty() {
  console.log('Property configuration (from src/config/property.ts):')
  console.log('='.repeat(60))
  console.log(`Name: ${PROPERTY.name}`)
  console.log(`Location: ${PROPERTY.city}, ${PROPERTY.state}`)
  console.log(`Bedrooms: ${PROPERTY.bedrooms}`)
  console.log(`Bathrooms: ${PROPERTY.bathrooms}`)
  console.log(`Max Guests: ${PROPERTY.maxGuests}`)
  console.log(`Square Feet: ${PROPERTY.squareFeet}`)
  console.log(`Base Price: $${PROPERTY.basePrice}/night`)
  console.log(`Cleaning Fee: $${PROPERTY.cleaningFee}`)
  console.log(`Min Nights: ${PROPERTY.minNights}`)
  console.log(`Check-in: ${PROPERTY.checkInTime}`)
  console.log(`Check-out: ${PROPERTY.checkOutTime}`)
  console.log(`\nAmenities: ${PROPERTY.amenities.length} total`)
  console.log(`Images: ${PROPERTY.images.length} total`)
  console.log(`Reviews: ${PROPERTY.reviews.length} total`)
  console.log('='.repeat(60))
}

checkProperty()
