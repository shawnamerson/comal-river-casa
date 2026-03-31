"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error"
  )
  const [errorMessage, setErrorMessage] = useState("")

  const verifyEmail = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus("success")
      // Full page navigation to ensure the admin layout re-renders
      // server-side and picks up the updated emailVerified status
      setTimeout(() => { window.location.href = "/admin" }, 2000)
    },
    onError: (err) => {
      setStatus("error")
      setErrorMessage(err.message)
    },
  })

  useEffect(() => {
    if (token && status === "verifying") {
      verifyEmail.mutate({ token })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>

      {status === "verifying" && (
        <p className="text-gray-600">Verifying your email...</p>
      )}

      {status === "success" && (
        <>
          <p className="text-green-600 mb-4">
            Your email has been verified successfully!
          </p>
          <p className="text-gray-500 text-sm">
            Redirecting to admin panel...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <p className="text-red-600 mb-4">
            {errorMessage || "Invalid or expired verification link."}
          </p>
          <Link
            href="/login"
            className="text-blue-600 hover:underline text-sm"
          >
            Back to login
          </Link>
        </>
      )}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense>
        <VerifyEmailContent />
      </Suspense>
    </main>
  )
}
