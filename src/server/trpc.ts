import { initTRPC, TRPCError } from "@trpc/server"
import { type Context } from "./context"

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    console.error("tRPC Error:", {
      code: error.code,
      message: error.message,
      cause: error.cause,
    })
    return shape
  },
})

export const router = t.router
export const publicProcedure = t.procedure

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || ctx.session.user?.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx })
})
