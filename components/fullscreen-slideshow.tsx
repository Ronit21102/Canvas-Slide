"use client"

import type React from "react"

import Image from "next/image"
import { Inter } from "next/font/google"
import type { Slide } from "@/types/slide"

const inter = Inter({ subsets: ["latin"] })

interface FullscreenSlideshowProps {
  slide: Slide
  isVisible: boolean
  showSlide: boolean
  fullscreenRef: React.RefObject<HTMLDivElement>
  onNextSlide: () => void
}

export function FullscreenSlideshow({
  slide,
  isVisible,
  showSlide,
  fullscreenRef,
  onNextSlide,
}: FullscreenSlideshowProps) {
  if (!isVisible) return null

  return (
    <div
      ref={fullscreenRef}
      className={`${inter.className} fixed inset-0 bg-black z-50 flex items-center justify-center cursor-none`}
      onClick={onNextSlide}
    >
      <div
        className={`relative w-screen h-screen flex items-center justify-center overflow-hidden transition-opacity duration-300 ${showSlide ? "opacity-100" : "opacity-0"}`}
      >
        <div className="relative w-full h-full" style={{ maxWidth: "177.78vh", maxHeight: "56.25vw" }}>
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            {slide.onlyImage && (
              <Image
                src={slide.onlyImage || ""}
                alt="Slide image"
                layout="fill"
                objectFit="contain"
                className="w-full h-full"
                quality={75}
              />
            )}
            {slide.custom?.videos && (
              <div className="w-full h-full">
                {slide.custom.videos.map((video, index) => (
                  <video key={index} src={video.src} autoPlay loop muted className="w-full h-full object-contain" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
