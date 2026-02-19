import { handlers } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Login rate limiter — runs in the Node.js runtime (not Edge), so the Map
// persists for the lifetime of the serverless function warm instance.
// Limits credential sign-in attempts to 10 per IP per 15 minutes.
// ---------------------------------------------------------------------------
interface RateLimitWindow {
  count: number
  resetAt: number
}

const authRateLimitStore = new Map<string, RateLimitWindow>()
const MIN = 60_000

function checkAuthRateLimit(ip: string): boolean {
  const key = `auth:${ip}`
  const now = Date.now()
  const entry = authRateLimitStore.get(key)
  if (!entry || now >= entry.resetAt) {
    authRateLimitStore.set(key, { count: 1, resetAt: now + 15 * MIN })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

export const GET = handlers.GET

export async function POST(req: NextRequest) {
  // Only rate-limit credential sign-in attempts, not signout or other POSTs
  if (req.nextUrl.pathname.includes("/callback/credentials")) {
    if (!checkAuthRateLimit(getIp(req))) {
      return new NextResponse("Too many login attempts. Please wait 15 minutes.", {
        status: 429,
      })
    }
  }
  return handlers.POST(req)
}
