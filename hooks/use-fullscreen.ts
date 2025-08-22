"use client"

import { useState, useEffect, useRef } from "react"

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showSlide, setShowSlide] = useState(false)
  const fullscreenRef = useRef<HTMLDivElement>(null)

  const startSlideshow = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      document.body.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`)
      })
      setIsFullscreen(true)
      setTimeout(() => {
        setShowSlide(true)
        setIsTransitioning(false)
      }, 300)
    }, 300)
  }

  const endSlideshow = () => {
    setShowSlide(false)
    setTimeout(() => {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false)
          setIsTransitioning(false)
        })
        .catch((err) => {
          console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`)
        })
    }, 300)
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  return {
    isFullscreen,
    isTransitioning,
    showSlide,
    fullscreenRef,
    startSlideshow,
    endSlideshow,
  }
}
