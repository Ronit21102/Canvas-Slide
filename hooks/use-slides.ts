"use client"

import { useState, useCallback } from "react"
import type { Slide } from "@/types/slide"
import { initialSlides } from "@/data/slides"

export function useSlides() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides)
  const [currentSlide, setCurrentSlide] = useState<number>(1)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length))
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 1))
  }, [])

  const addSlide = useCallback(() => {
    setSlides((prevSlides) => [
      ...prevSlides,
      {
        id: prevSlides.length + 1,
        onlyImage:
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blank-slide-placeholder-7Xo7qvMmIGfACzMUXLNDOGwz9HKaIa.png",
      },
    ])
  }, [])

  const getCurrentSlide = useCallback(() => {
    return slides[currentSlide - 1]
  }, [slides, currentSlide])

  return {
    slides,
    currentSlide,
    setCurrentSlide,
    nextSlide,
    prevSlide,
    addSlide,
    getCurrentSlide,
  }
}
