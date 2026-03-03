import { router } from '../trpc'
import { bookingRouter } from './booking'
import { adminRouter } from './admin'
import { externalCalendarRouter } from './externalCalendar'
import { reviewRouter } from './review'
import { analyticsRouter } from './analytics'

export const appRouter = router({
  booking: bookingRouter,
  admin: adminRouter,
  externalCalendar: externalCalendarRouter,
  review: reviewRouter,
  analytics: analyticsRouter,
})

export type AppRouter = typeof appRouter
