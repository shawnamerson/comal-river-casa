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

// Requires ADMIN role but allows unverified email (for sending verification emails)
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session || ctx.session.user?.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx })
})

// Requires ADMIN role AND verified email
export const verifiedAdminProcedure = adminProcedure.use(async ({ ctx, next }) => {
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.session!.user.id },
    select: { emailVerified: true },
  })
  if (!user?.emailVerified) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Email verification required" })
  }
  return next({ ctx })
})
