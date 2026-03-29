import { prisma } from "@/lib/db/prisma"
import { auth } from "@/lib/auth"

export async function createContext(ip?: string) {
  const session = await auth()
  return {
    prisma,
    session,
    ip: ip ?? "unknown",
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
