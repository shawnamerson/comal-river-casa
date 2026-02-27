import { handlers } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ---------------------------------------------------------------------------
// Login rate limiter backed by Upstash Redis.
// Limits credential sign-in attempts to 10 per IP per 15 minutes.
// Works correctly across all Vercel serverless instances.
// ---------------------------------------------------------------------------
const loginLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15m"),
  prefix: "rl:auth",
})

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
    const { success } = await loginLimiter.limit(getIp(req))
    if (!success) {
      return new NextResponse("Too many login attempts. Please wait 15 minutes.", {
        status: 429,
      })
    }
  }
  return handlers.POST(req)
}
