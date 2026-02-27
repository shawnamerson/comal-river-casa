import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const { auth } = NextAuth(authConfig)

// ---------------------------------------------------------------------------
// Distributed rate limiter backed by Upstash Redis.
// Works correctly across all Vercel serverless/edge instances.
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
// ---------------------------------------------------------------------------
const redis = Redis.fromEnv()

// Booking creation: 5 per hour (prevents date-spam)
const bookingCreateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1h"),
  prefix: "rl:create",
})

// Booking lookup: 10 per 5 minutes (prevents ID enumeration)
const bookingLookupLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "5m"),
  prefix: "rl:lookup",
})

// Booking cancel: 5 per 15 minutes
const bookingCancelLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15m"),
  prefix: "rl:cancel",
})

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

async function isRateLimited(
  pathname: string,
  ip: string
): Promise<boolean> {
  if (pathname === "/api/trpc/booking.create") {
    const { success } = await bookingCreateLimiter.limit(ip)
    return !success
  }
  if (pathname === "/api/trpc/booking.lookup") {
    const { success } = await bookingLookupLimiter.limit(ip)
    return !success
  }
  if (pathname === "/api/trpc/booking.cancel") {
    const { success } = await bookingCancelLimiter.limit(ip)
    return !success
  }
  return false
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
