"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselSlide {
  image: string
  title?: string
  description?: string
  buttonText?: string
  buttonLink?: string
}

interface CarouselProps {
  images?: string[]
  slides?: CarouselSlide[]
  autoPlay?: boolean
  interval?: number
  showOverlay?: boolean
  overlayOpacity?: number
}

export function Carousel({
  images = [],
  slides = [],
  autoPlay = true,
  interval = 5000,
  showOverlay = true,
  overlayOpacity = 40,
}: CarouselProps) {
  const [current, setCurrent] = useState(0)

  // Convertir les images simples en slides
  const carouselSlides: CarouselSlide[] =
    slides.length > 0
      ? slides
      : images.map((image) => ({
        image,
        title: undefined,
        description: undefined,
      }))

  useEffect(() => {
    if (!autoPlay || carouselSlides.length === 0) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselSlides.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, carouselSlides.length])

  const goToSlide = (index: number) => {
    setCurrent(index)
  }

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % carouselSlides.length)
  }

  if (carouselSlides.length === 0) {
    return <div className="w-full h-96 bg-gray-300 rounded-lg flex items-center justify-center">No slides available</div>
  }

  const currentSlide = carouselSlides[current]

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-gray-900  overflow-hidden group">
      {/* Background Images Container */}
      <div className="absolute inset-0 w-full h-full">
        {carouselSlides.map((slide, index) => (
          <div key={index} className="absolute inset-0 w-full h-full">
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.title || `Slide ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"
                }`}
            />
          </div>
        ))}
      </div>

      {/* Dark Overlay Gradient */}
      {showOverlay && (
        <>
          <div className="absolute inset-0 bg-black/40" style={{ opacity: overlayOpacity / 100 }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70"></div>
        </>
      )}

      {/* Content Overlay - Centered */}
      {(currentSlide.title || currentSlide.description) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl animate-fade-in">
            {currentSlide.title && (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance leading-tight drop-shadow-lg">
                {currentSlide.title}
              </h1>
            )}
            {currentSlide.description && (
              <p className="text-lg md:text-xl text-gray-100 mb-8 drop-shadow-md">{currentSlide.description}</p>
            )}
            {currentSlide.buttonText && currentSlide.buttonLink && (
              <a
                href={currentSlide.buttonLink}
                className="inline-block bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {currentSlide.buttonText}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all duration-300 z-30 hidden sm:flex items-center justify-center group-hover:bg-white/40 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} className="text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-3 rounded-full transition-all duration-300 z-30 hidden sm:flex items-center justify-center group-hover:bg-white/40 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={28} className="text-white" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full backdrop-blur-sm ${index === current ? "bg-white w-8 h-3" : "bg-white/50 hover:bg-white/75 w-3 h-3"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play Indicator */}
      {autoPlay && (
        <div className="absolute bottom-8 left-8 text-white/70 text-xs font-medium z-30 hidden sm:block">
          Auto-rotating • {Math.round(interval / 1000)}s
        </div>
      )}
    </div>
  )
}
