import { z } from 'zod'
import { router, publicProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { resend } from '@/lib/resend'
import { PasswordResetEmail } from '@/emails/PasswordReset'
import { EmailVerificationEmail } from '@/emails/EmailVerification'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

function generateToken(): { raw: string; hashed: string } {
  const raw = crypto.randomBytes(32).toString('hex')
  const hashed = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hashed }
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

export const authRouter = router({
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      })

      // Always return success to avoid revealing whether email exists
      if (!user) {
        return { success: true }
      }

      const identifier = `reset:${input.email}`

      // Delete any existing reset tokens for this email
      await ctx.prisma.verificationToken.deleteMany({
        where: { identifier },
      })

      const { raw, hashed } = generateToken()

      await ctx.prisma.verificationToken.create({
        data: {
          identifier,
          token: hashed,
          expires: new Date(Date.now() + TOKEN_EXPIRY_MS),
        },
      })

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login/reset-password?token=${raw}`

      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: input.email,
        subject: 'Password Reset — Comal River Casa',
        react: PasswordResetEmail({ resetUrl }),
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'password.reset_requested',
          targetId: user.id,
        },
      })

      return { success: true }
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      newPassword: passwordSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const hashed = hashToken(input.token)

      const verificationToken = await ctx.prisma.verificationToken.findFirst({
        where: {
          token: hashed,
          identifier: { startsWith: 'reset:' },
        },
      })

      if (!verificationToken || verificationToken.expires < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired reset link. Please request a new one.',
        })
      }

      const email = verificationToken.identifier.replace('reset:', '')
      const user = await ctx.prisma.user.findUnique({ where: { email } })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      const hash = await bcrypt.hash(input.newPassword, 10)

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { password: hash },
      })

      // Delete used token
      await ctx.prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'password.reset_completed',
          targetId: user.id,
        },
      })

      return { success: true }
    }),

  sendVerificationEmail: adminProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.session!.user.id
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      const identifier = `verify:${user.email}`

      // Delete any existing verification tokens for this email
      await ctx.prisma.verificationToken.deleteMany({
        where: { identifier },
      })

      const { raw, hashed } = generateToken()

      await ctx.prisma.verificationToken.create({
        data: {
          identifier,
          token: hashed,
          expires: new Date(Date.now() + TOKEN_EXPIRY_MS),
        },
      })

      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login/verify-email?token=${raw}`

      await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: 'Verify Your Email — Comal River Casa',
        react: EmailVerificationEmail({ verificationUrl, name: user.name ?? undefined }),
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId,
          action: 'email.verification_sent',
          targetId: userId,
        },
      })

      return { success: true }
    }),

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const hashed = hashToken(input.token)

      const verificationToken = await ctx.prisma.verificationToken.findFirst({
        where: {
          token: hashed,
          identifier: { startsWith: 'verify:' },
        },
      })

      if (!verificationToken || verificationToken.expires < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired verification link. Please request a new one.',
        })
      }

      const email = verificationToken.identifier.replace('verify:', '')
      const user = await ctx.prisma.user.findUnique({ where: { email } })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      await ctx.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })

      // Delete used token
      await ctx.prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      })

      await ctx.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'email.verified',
          targetId: user.id,
        },
      })

      return { success: true }
    }),
})
