import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Edge-compatible config — no Prisma imports
// Used by middleware for JWT validation
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 }, // 1 hour
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // No maxAge — browser session cookie, cleared when browser closes
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // authorize is overridden in auth.ts with the full Prisma implementation
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async () => null,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.sub as string
      }
      return session
    },
  },
}
