import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"

const { auth } = NextAuth(authConfig)

// ---------------------------------------------------------------------------
// Distributed rate limiter backed by Upstash Redis.
// Works correctly across all Vercel serverless/edge instances.
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
// ---------------------------------------------------------------------------

// Booking creation: 5 per hour (prevents date-spam)
const bookingCreateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1h"),
  prefix: "rl:create",
})

// Booking lookup: 5 per 5 minutes (prevents ID enumeration)
const bookingLookupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "5m"),
  prefix: "rl:lookup",
})

// Booking cancel: 5 per 15 minutes
const bookingCancelLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15m"),
  prefix: "rl:cancel",
})

// Password reset: 3 per 15 minutes
const passwordResetLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15m"),
  prefix: "rl:pw-reset",
})

// Verification email: 3 per 15 minutes
const verifyEmailLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15m"),
  prefix: "rl:verify-email",
})

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

function getLimiterForPath(pathname: string): Ratelimit | null {
  switch (pathname) {
    case "/api/trpc/booking.create":
      return bookingCreateLimiter
    case "/api/trpc/booking.lookup":
      return bookingLookupLimiter
    case "/api/trpc/booking.cancel":
      return bookingCancelLimiter
    case "/api/trpc/auth.requestPasswordReset":
    case "/api/trpc/admin.changePassword":
      return passwordResetLimiter
    case "/api/trpc/auth.sendVerificationEmail":
      return verifyEmailLimiter
    default:
      return null
  }
}

async function isRateLimited(
  pathname: string,
  ip: string
): Promise<boolean> {
  const limiter = getLimiterForPath(pathname)
  if (!limiter) return false

  try {
    const { success } = await limiter.limit(ip)
    return !success
  } catch (error) {
    // Fail open: a Redis outage (or mid-rotation credential mismatch)
    // should never block bookings or auth flows.
    console.error(`Rate limiter unavailable for ${pathname}:`, error)
    return false
  }
}

export default auth(async (req) => {
  const { pathname } = req.nextUrl
  const ip = getIp(req)

  // Rate limiting for sensitive tRPC endpoints
  if (await isRateLimited(pathname, ip)) {
    return new NextResponse("Too many requests", { status: 429 })
  }

  // Admin route protection
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/admin/:path*", "/api/trpc/:path*"],
}
