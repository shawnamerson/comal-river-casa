import { router } from '../trpc'
import { bookingRouter } from './booking'
import { adminRouter } from './admin'
import { externalCalendarRouter } from './externalCalendar'
import { reviewRouter } from './review'

export const appRouter = router({
  booking: bookingRouter,
  admin: adminRouter,
  externalCalendar: externalCalendarRouter,
  review: reviewRouter,
})

export type AppRouter = typeof appRouter
