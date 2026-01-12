import { initTRPC } from '@trpc/server'
import { type Context } from './context'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    console.error('tRPC Error:', {
      code: error.code,
      message: error.message,
      cause: error.cause,
    })
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure
