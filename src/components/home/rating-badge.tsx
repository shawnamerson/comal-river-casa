interface RatingBadgeProps {
  averageRating: number
  reviewCount: number
  variant?: 'light' | 'dark'
  className?: string
}

export function RatingBadge({
  averageRating,
  reviewCount,
  variant = 'dark',
  className = '',
}: RatingBadgeProps) {
  if (reviewCount === 0) return null

  const isLight = variant === 'light'
  const containerClasses = isLight
    ? 'bg-white/95 text-gray-900 shadow-sm'
    : 'bg-white/15 text-white backdrop-blur-sm ring-1 ring-white/30'
  const dividerClass = isLight ? 'text-gray-400' : 'text-white/60'
  const countClass = isLight ? 'text-gray-600' : 'text-white/90'

  const rounded = averageRating.toFixed(1)
  const reviewLabel = reviewCount === 1 ? 'review' : 'reviews'

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${containerClasses} ${className}`}
      aria-label={`Rated ${rounded} out of 5 from ${reviewCount} ${reviewLabel}`}
    >
      <span className="text-yellow-400" aria-hidden="true">★</span>
      <span>{rounded}</span>
      <span className={dividerClass} aria-hidden="true">·</span>
      <span className={countClass}>
        {reviewCount} {reviewLabel}
      </span>
    </div>
  )
}
