'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface Place {
  name: string
  description?: string
  suggestions?: string
  url?: string
  image?: string
  section: string
}

interface GuidebookSlideshowProps {
  places: Place[]
  onClose: () => void
}

export function GuidebookSlideshow({ places, onClose }: GuidebookSlideshowProps) {
  const [index, setIndex] = useState(0)
  const place = places[index]

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % places.length)
  }, [places.length])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + places.length) % places.length)
  }, [places.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        next()
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-sm">
        <div className="text-white/60 text-sm">
          <span className="text-white font-semibold">{index + 1}</span> / {places.length}
          <span className="ml-3 text-white/40">{place.section}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-2xl leading-none transition-colors"
          aria-label="Close slideshow"
        >
          &times;
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Image side */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[40vh] md:min-h-0">
          {place.image ? (
            <Image
              src={place.image}
              alt={place.name}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <div className="text-white/20 text-6xl font-bold">
              {place.name.charAt(0)}
            </div>
          )}

          {/* Nav arrows on image */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-xl"
            aria-label="Previous"
          >
            &#8249;
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition-colors text-xl"
            aria-label="Next"
          >
            &#8250;
          </button>
        </div>

        {/* Info side */}
        <div className="md:w-96 bg-gray-950 p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold text-white mb-2">{place.name}</h2>
          <p className="text-blue-400 text-sm mb-4">{place.section}</p>

          {place.description && (
            <p className="text-gray-300 leading-relaxed mb-4">
              {place.description}
            </p>
          )}

          {place.suggestions && (
            <div className="mb-6">
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">What to try</p>
              <p className="text-gray-300 text-sm italic">
                {place.suggestions}
              </p>
            </div>
          )}

          {place.url && (
            <a
              href={place.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Visit Website
            </a>
          )}

          {/* Dot navigation */}
          <div className="mt-8 flex flex-wrap gap-1.5">
            {places.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile swipe hint */}
      <div className="md:hidden text-center py-3 bg-black/80 text-gray-500 text-xs">
        Use arrows or swipe to navigate
      </div>
    </div>
  )
}
