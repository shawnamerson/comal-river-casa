'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0)
  const interactive = !!onRate
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`text-xl ${interactive ? 'cursor-pointer' : ''} ${
            star <= (hover || rating) ? 'text-yellow-500' : 'text-gray-300'
          }`}
          onMouseEnter={interactive ? () => setHover(star) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          onClick={interactive ? () => onRate!(star) : undefined}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    DIRECT: 'bg-blue-100 text-blue-800',
    AIRBNB: 'bg-red-100 text-red-800',
    VRBO: 'bg-indigo-100 text-indigo-800',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[source] || 'bg-gray-100 text-gray-800'}`}>
      {source === 'DIRECT' ? 'Direct' : source === 'AIRBNB' ? 'Airbnb' : 'VRBO'}
    </span>
  )
}

export default function AdminReviewsPage() {
  const router = useRouter()
  const [showAddForm, setShowAddForm] = useState(false)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')

  // Add review form state
  const [newReview, setNewReview] = useState({
    guestName: '',
    rating: 0,
    comment: '',
    source: 'AIRBNB' as 'AIRBNB' | 'VRBO',
    createdAt: '',
  })

  const { data: reviews, refetch } = trpc.review.getAllReviews.useQuery()

  const publishReview = trpc.review.publishReview.useMutation({
    onSuccess: () => refetch(),
  })

  const respondToReview = trpc.review.respondToReview.useMutation({
    onSuccess: () => {
      setRespondingTo(null)
      setResponseText('')
      refetch()
    },
  })

  const createReview = trpc.review.createReview.useMutation({
    onSuccess: () => {
      setShowAddForm(false)
      setNewReview({ guestName: '', rating: 0, comment: '', source: 'AIRBNB', createdAt: '' })
      refetch()
    },
  })

  const deleteReview = trpc.review.deleteReview.useMutation({
    onSuccess: () => refetch(),
  })

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (newReview.rating === 0) return
    createReview.mutate({
      guestName: newReview.guestName,
      rating: newReview.rating,
      comment: newReview.comment || undefined,
      source: newReview.source,
      createdAt: newReview.createdAt || undefined,
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Reviews</h1>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add Review'}
            </Button>
          </div>
        </div>

        {/* Add Review Form */}
        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add External Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddReview} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Guest Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newReview.guestName}
                      onChange={(e) => setNewReview({ ...newReview, guestName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Source *</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newReview.source}
                      onChange={(e) => setNewReview({ ...newReview, source: e.target.value as 'AIRBNB' | 'VRBO' })}
                    >
                      <option value="AIRBNB">Airbnb</option>
                      <option value="VRBO">VRBO</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Rating *</label>
                  <StarRating rating={newReview.rating} onRate={(r) => setNewReview({ ...newReview, rating: r })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Comment</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Review Date (optional, for backdating)</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={newReview.createdAt}
                    onChange={(e) => setNewReview({ ...newReview, createdAt: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={createReview.isPending || newReview.rating === 0}>
                  {createReview.isPending ? 'Adding...' : 'Add Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {!reviews || reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No reviews yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {review.guestName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold">{review.guestName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{format(new Date(review.createdAt), 'MMM dd, yyyy')}</span>
                          <SourceBadge source={review.source} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          review.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {review.isPublished ? 'Published' : 'Unpublished'}
                      </span>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 mb-3 italic">&ldquo;{review.comment}&rdquo;</p>
                  )}

                  {review.booking && (
                    <p className="text-xs text-gray-400 mb-3">
                      Booking: {format(new Date(review.booking.checkIn), 'MMM dd')} - {format(new Date(review.booking.checkOut), 'MMM dd, yyyy')} ({review.booking.guestEmail})
                    </p>
                  )}

                  {review.hostResponse && (
                    <div className="bg-gray-50 border-l-4 border-blue-500 p-3 mb-3">
                      <p className="text-sm font-semibold text-gray-600 mb-1">Host Response</p>
                      <p className="text-gray-700 text-sm">{review.hostResponse}</p>
                    </div>
                  )}

                  {/* Respond form */}
                  {respondingTo === review.id && (
                    <div className="mb-3 space-y-2">
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                        placeholder="Write your response..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={respondToReview.isPending || !responseText.trim()}
                          onClick={() =>
                            respondToReview.mutate({ id: review.id, hostResponse: responseText.trim() })
                          }
                        >
                          {respondToReview.isPending ? 'Saving...' : 'Save Response'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRespondingTo(null)
                            setResponseText('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={publishReview.isPending}
                      onClick={() =>
                        publishReview.mutate({ id: review.id, isPublished: !review.isPublished })
                      }
                    >
                      {review.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRespondingTo(review.id)
                        setResponseText(review.hostResponse || '')
                      }}
                    >
                      {review.hostResponse ? 'Edit Response' : 'Add Response'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteReview.isPending}
                      onClick={() => {
                        if (confirm('Delete this review?')) {
                          deleteReview.mutate({ id: review.id })
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
