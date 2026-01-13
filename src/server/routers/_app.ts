import { router } from '../trpc'
import { bookingRouter } from './booking'
import { adminRouter } from './admin'
import { externalCalendarRouter } from './externalCalendar'

export const appRouter = router({
  booking: bookingRouter,
  admin: adminRouter,
  externalCalendar: externalCalendarRouter,
})

export type AppRouter = typeof appRouter
