"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { trpc } from "@/lib/trpc/client"

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess] = useState(false)

  const resetPassword = trpc.auth.resetPassword.useMutation({
    onSuccess: () => setSuccess(true),
  })

  if (!token) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid Link</h1>
        <p className="text-gray-600 mb-4">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/login/forgot-password"
          className="text-blue-600 hover:underline text-sm"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  const allRulesPassed = PASSWORD_RULES.every((r) => r.test(password))
  const passwordsMatch = password === confirmPassword
  const canSubmit = allRulesPassed && passwordsMatch && confirmPassword.length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    resetPassword.mutate({ token: token!, newPassword: password })
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 className="text-2xl font-bold mb-2 text-center">
        Set New Password
      </h1>
      <p className="text-gray-500 text-sm text-center mb-6">
        Comal River Casa
      </p>

      {success ? (
        <div className="text-center">
          <p className="text-green-600 mb-4">
            Your password has been reset successfully.
          </p>
          <Link
            href="/login"
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Sign in with your new password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password.length > 0 && (
              <ul className="mt-2 space-y-1">
                {PASSWORD_RULES.map((rule) => (
                  <li
                    key={rule.label}
                    className={`text-xs flex items-center gap-1 ${
                      rule.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {rule.test(password) ? "\u2713" : "\u2022"} {rule.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-red-600 text-xs mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {resetPassword.error && (
            <p className="text-red-600 text-sm">
              {resetPassword.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || resetPassword.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {resetPassword.isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </main>
  )
}
