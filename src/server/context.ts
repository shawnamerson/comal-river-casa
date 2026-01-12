import { prisma } from '@/lib/db/prisma'

export function createContext() {
  return {
    prisma,
  }
}

export type Context = ReturnType<typeof createContext>
