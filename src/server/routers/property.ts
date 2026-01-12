import { router, publicProcedure } from '../trpc'
import { PROPERTY } from '@/config/property'

// Property details are hardcoded in src/config/property.ts
// This router is kept for backwards compatibility but returns the hardcoded data

export const propertyRouter = router({
  // Get the single property for this site
  get: publicProcedure.query(() => {
    return PROPERTY
  }),
})
