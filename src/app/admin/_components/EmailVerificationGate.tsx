"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { trpc } from "@/lib/trpc/client"

export default function EmailVerificationGate() {
  const [sent, setSent] = useState(false)

  const sendVerification = trpc.auth.sendVerificationEmail.useMutation({
    onSuccess: () => setSent(true),
  })

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">Verify Your Email</h2>
        <p className="text-gray-600 mb-6">
          You need to verify your email address before you can access the admin
          panel.
        </p>

        {sent ? (
          <div>
            <p className="text-green-600 mb-4">
              Verification email sent! Check your inbox and click the link to
              verify.
            </p>
            <button
              onClick={() => {
                setSent(false)
                sendVerification.mutate()
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              Resend email
            </button>
          </div>
        ) : (
          <button
            onClick={() => sendVerification.mutate()}
            disabled={sendVerification.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium mb-4"
          >
            {sendVerification.isPending
              ? "Sending..."
              : "Send Verification Email"}
          </button>
        )}

        {sendVerification.error && (
          <p className="text-red-600 text-sm mt-2">
            {sendVerification.error.message}
          </p>
        )}

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-gray-500 hover:underline text-sm"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
