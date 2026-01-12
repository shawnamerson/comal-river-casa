import { router } from '../trpc'
import { bookingRouter } from './booking'
import { adminRouter } from './admin'

export const appRouter = router({
  booking: bookingRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
