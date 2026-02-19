import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextRequest, NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// ---------------------------------------------------------------------------
// Simple sliding-window rate limiter
// Uses module-level state that persists for the lifetime of the edge isolate.
// This provides meaningful per-IP brute-force protection without requiring
// external infrastructure. For distributed/high-volume protection, swap in
// Upstash Redis (@upstash/ratelimit) and add UPSTASH_REDIS_REST_URL/TOKEN.
// ---------------------------------------------------------------------------
interface RateLimitWindow {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitWindow>()

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)
  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }
  if (entry.count >= limit) return false // blocked
  entry.count++
  return true // allowed
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

const MIN = 60_000

export default auth((req) => {
  const { pathname } = req.nextUrl
  const ip = getIp(req)

  // Rate limiting for sensitive endpoints
  const rateLimited =
    // Login: 10 POST attempts per 15 minutes (not session/CSRF GETs)
    (pathname.startsWith("/api/auth") && req.method === "POST" &&
      !checkRateLimit(`auth:${ip}`, 10, 15 * MIN)) ||
    // Booking creation: 5 per hour (prevents date-spam)
    (pathname === "/api/trpc/booking.create" &&
      !checkRateLimit(`create:${ip}`, 5, 60 * MIN)) ||
    // Booking lookup: 10 per 5 minutes (prevents ID enumeration)
    (pathname === "/api/trpc/booking.lookup" &&
      !checkRateLimit(`lookup:${ip}`, 10, 5 * MIN)) ||
    // Booking cancel: 5 per 15 minutes
    (pathname === "/api/trpc/booking.cancel" &&
      !checkRateLimit(`cancel:${ip}`, 5, 15 * MIN))

  if (rateLimited) {
    return new NextResponse("Too many requests", { status: 429 })
  }

  // Admin route protection
  if (pathname.startsWith("/admin") && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*", "/api/trpc/:path*"],
}
