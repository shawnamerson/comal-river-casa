"use client"

import { useState } from "react"
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const requestReset = trpc.auth.requestPasswordReset.useMutation({
    onSuccess: () => setSubmitted(true),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    requestReset.mutate({ email })
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Comal River Casa
        </p>

        {submitted ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">
              If an account exists with that email, you&apos;ll receive a reset
              link shortly.
            </p>
            <Link
              href="/login"
              className="text-blue-600 hover:underline text-sm"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {requestReset.error && (
              <p className="text-red-600 text-sm">
                Something went wrong. Please try again.
              </p>
            )}
            <button
              type="submit"
              disabled={requestReset.isPending}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {requestReset.isPending ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-gray-500 hover:underline text-sm"
              >
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}
