import { Card, CardContent } from '@/components/ui/card'

interface Review {
  id: string
  guestName: string
  rating: number
  comment: string | null
  hostResponse: string | null
  source: string
}

interface ReviewsSectionProps {
  reviews: Review[]
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) return null

  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Guest Experiences
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-xl text-gray-600">
            Hear what our guests have to say
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scroll-reviews {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .reviews-track {
          animation: scroll-reviews var(--scroll-duration, 30s) linear infinite;
        }
        .reviews-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div
        className="reviews-track flex gap-6 w-max px-6"
        style={{ '--scroll-duration': `${reviews.length * 8}s` } as React.CSSProperties}
      >
        {/* Duplicate the reviews so the loop is seamless */}
        {[...reviews, ...reviews].map((review, i) => (
          <Card key={`${review.id}-${i}`} className="border-2 hover:border-blue-200 transition-colors w-[350px] md:w-[420px] shrink-0">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-2xl font-bold text-blue-600">
                    {review.guestName.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {review.guestName}
                    {review.source !== 'DIRECT' && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        review.source === 'AIRBNB' ? 'bg-red-100 text-red-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {review.source === 'AIRBNB' ? 'Airbnb' : 'VRBO'}
                      </span>
                    )}
                  </div>
                  <div className="text-yellow-500 text-xl">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 leading-relaxed italic line-clamp-4">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
              {review.hostResponse && (
                <div className="mt-4 bg-gray-50 border-l-4 border-blue-500 p-3">
                  <p className="text-sm font-semibold text-gray-600 mb-1">Host Response</p>
                  <p className="text-gray-700 text-sm line-clamp-2">{review.hostResponse}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
