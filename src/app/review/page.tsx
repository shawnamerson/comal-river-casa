'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import Link from 'next/link'

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    }>
      <ReviewContent />
    </Suspense>
  )
}

function ReviewContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data: booking, isLoading, error } = trpc.review.getBookingByToken.useQuery(
    { token: token! },
    { enabled: !!token }
  )

  const submitReview = trpc.review.submitReviewByToken.useMutation({
    onSuccess: () => setSubmitted(true),
  })

  if (!token) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Review Link</h1>
          <p className="text-gray-600 mb-6">This link is missing a review token.</p>
          <Link href="/" className="text-blue-600 hover:underline">Go to Homepage</Link>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Review Link</h1>
          <p className="text-gray-600 mb-6">This review link is invalid or has expired.</p>
          <Link href="/" className="text-blue-600 hover:underline">Go to Homepage</Link>
        </div>
      </main>
    )
  }

  if (booking?.hasReview) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            You&apos;ve already submitted a review for this stay. We really appreciate your feedback!
          </p>
          <Link href="/" className="text-blue-600 hover:underline">Go to Homepage</Link>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">Thank You, {booking?.guestName}!</h1>
          <p className="text-gray-600 mb-6">
            Your review means the world to us. We hope to host you again soon!
          </p>
          <Link href="/" className="text-blue-600 hover:underline">Visit Comal River Casa</Link>
        </div>
      </main>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitReview.mutate({ token, rating, comment })
  }

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">How Was Your Stay?</h1>
          <p className="text-gray-600">
            Hi {booking?.guestName}, we&apos;d love to hear about your experience at Comal River Casa!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-3">Rating</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '\u2B50' : '\u2606'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Tell us about your stay <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="What did you enjoy most?"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {submitReview.error && (
            <p className="text-red-600 text-sm">{submitReview.error.message}</p>
          )}

          <button
            type="submit"
            disabled={submitReview.isPending}
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </main>
  )
}
