'use client'

import { useState } from 'react'
import { GuidebookSlideshow } from './guidebook-slideshow'

interface Place {
  name: string
  description?: string
  suggestions?: string
  url?: string
  image?: string
  section: string
}

interface SlideshowTriggerProps {
  places: Place[]
}

export function GuidebookSlideshowTrigger({ places }: SlideshowTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        View Visual Tour
      </button>
      {open && <GuidebookSlideshow places={places} onClose={() => setOpen(false)} />}
    </>
  )
}
