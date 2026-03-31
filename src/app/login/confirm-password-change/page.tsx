"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { trpc } from "@/lib/trpc/client"

function ConfirmPasswordChangeContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"confirming" | "success" | "error">(
    token ? "confirming" : "error"
  )
  const [errorMessage, setErrorMessage] = useState("")

  const confirmChange = trpc.auth.confirmPasswordChange.useMutation({
    onSuccess: () => {
      setStatus("success")
    },
    onError: (err) => {
      setStatus("error")
      setErrorMessage(err.message)
    },
  })

  useEffect(() => {
    if (token && status === "confirming") {
      confirmChange.mutate({ token })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
      <h1 className="text-2xl font-bold mb-4">Password Change</h1>

      {status === "confirming" && (
        <p className="text-gray-600">Confirming your password change...</p>
      )}

      {status === "success" && (
        <>
          <p className="text-green-600 mb-4">
            Your password has been changed successfully!
          </p>
          <Link
            href="/login"
            className="text-blue-600 hover:underline text-sm"
          >
            Go to login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <p className="text-red-600 mb-4">
            {errorMessage || "Invalid or expired confirmation link."}
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

export default function ConfirmPasswordChangePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense>
        <ConfirmPasswordChangeContent />
      </Suspense>
    </main>
  )
}
