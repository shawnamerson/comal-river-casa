'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { PROPERTY } from '@/config/property'

type PropertyImage = typeof PROPERTY.images[number]

interface GallerySectionProps {
  images: readonly PropertyImage[]
}

export function GallerySection({ images }: GallerySectionProps) {
  const [lightboxImage, setLightboxImage] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setLightboxImage(index)
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  const nextImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage + 1) % images.length)
    }
  }

  const previousImage = () => {
    if (lightboxImage !== null) {
      setLightboxImage((lightboxImage - 1 + images.length) % images.length)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') previousImage()
  }

  if (images.length <= 1) return null

  return (
    <>
      <section className="py-24 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              See Yourself Here
            </h2>
            <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300">
              Explore our beautifully designed space
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.slice(1, 7).map((image, index) => (
              <div
                key={index}
                className="relative h-64 rounded-lg overflow-hidden group cursor-pointer"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image.url}
                  alt={image.altText}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-white text-4xl">🔍</div>
                </div>
              </div>
            ))}
          </div>

          {images.length > 7 && (
            <div className="text-center mt-8">
              <p className="text-gray-400">
                + {images.length - 7} more photos
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-50"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>

          {/* Previous Button */}
          <button
            className="absolute left-2 md:left-4 text-white text-4xl md:text-5xl hover:text-gray-300 transition-colors z-50 bg-black/30 w-12 h-12 rounded-full flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              previousImage()
            }}
            aria-label="Previous"
          >
            ‹
          </button>

          {/* Image */}
          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxImage].url}
              alt={images[lightboxImage].altText}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Next Button */}
          <button
            className="absolute right-2 md:right-4 text-white text-4xl md:text-5xl hover:text-gray-300 transition-colors z-50 bg-black/30 w-12 h-12 rounded-full flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              nextImage()
            }}
            aria-label="Next"
          >
            ›
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm md:text-lg bg-black/50 px-3 md:px-4 py-1 md:py-2 rounded-full">
            {lightboxImage + 1} / {images.length}
          </div>

          {/* Image Caption */}
          <div className="absolute bottom-14 md:bottom-16 left-1/2 transform -translate-x-1/2 text-white text-center max-w-2xl px-4">
            <p className="text-sm md:text-lg">{images[lightboxImage].altText}</p>
          </div>
        </div>
      )}
    </>
  )
}
