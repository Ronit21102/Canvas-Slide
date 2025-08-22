"use client"

import { useState, useEffect } from "react"
import { useEditor } from "@/hooks/use-editor"
import { SlideHeader } from "@/components/slide-header"
import { SlideSidebar } from "@/components/slide-sidebar"
import { SlideViewer } from "@/components/slide-viewer"
import { SlideControls } from "@/components/slide-controls"
import { FullscreenSlideshow } from "@/components/fullscreen-slideshow"
import { useFullscreen } from "@/hooks/use-fullscreen"
import type { Slide } from "@/types/slide"
import type { Template } from "@/data/templates"

export default function MoodboardEditor() {
  const [title, setTitle] = useState("v0 Moodboard Editor")
  const [showHeader, setShowHeader] = useState(true)

  const {
    editorState,
    getCurrentSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    renameSlide,
    setCurrentSlide,
    setEditorState,
  } = useEditor()

  const { isFullscreen, isTransitioning, showSlide, fullscreenRef, startSlideshow, endSlideshow } = useFullscreen()

  // Navigation functions for slideshow
  const nextSlide = () => {
    const currentIndex = editorState.slides.findIndex((slide) => slide.id === editorState.currentSlideId)
    const nextIndex = (currentIndex + 1) % editorState.slides.length
    setCurrentSlide(editorState.slides[nextIndex].id)
  }

  const prevSlide = () => {
    const currentIndex = editorState.slides.findIndex((slide) => slide.id === editorState.currentSlideId)
    const prevIndex = currentIndex === 0 ? editorState.slides.length - 1 : currentIndex - 1
    setCurrentSlide(editorState.slides[prevIndex].id)
  }

  const handleImport = (importedSlides: Slide[]) => {
    if (importedSlides.length === 0) return

    setEditorState((prev) => ({
      ...prev,
      slides: importedSlides,
      currentSlideId: importedSlides[0].id,
      canvasState: {
        ...prev.canvasState,
        selectedElements: [],
      },
      history: [],
      historyIndex: -1,
    }))
  }

  const handleTemplateSelect = (template: Template) => {
    console.log("[v0] Template selected:", template.name)
    const templateSlides: Slide[] = template.slides.map((slideTemplate, index) => ({
      ...slideTemplate,
      id: `slide-${Date.now()}-${index}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      elements: slideTemplate.elements.map((element) => ({
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    }))

    console.log("[v0] Created template slides:", templateSlides)

    setEditorState((prev) => ({
      ...prev,
      slides: templateSlides,
      currentSlideId: templateSlides[0].id,
      canvasState: {
        ...prev.canvasState,
        selectedElements: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
      history: [],
      historyIndex: -1,
    }))

    console.log("[v0] Template applied, new current slide:", templateSlides[0].id)
    setTitle(template.name)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const nextKeys = ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"]
      const prevKeys = ["ArrowLeft", "ArrowUp", "PageUp"]
      const endKeys = ["Escape"]
      const nonFullscreenNextKeys = ["ArrowDown", "PageDown"]
      const nonFullscreenPrevKeys = ["ArrowUp", "PageUp"]

      if (isFullscreen) {
        if (nextKeys.includes(e.key)) {
          e.preventDefault()
          nextSlide()
        } else if (prevKeys.includes(e.key)) {
          e.preventDefault()
          prevSlide()
        } else if (endKeys.includes(e.key) && isFullscreen) {
          e.preventDefault()
          endSlideshow()
        }
      } else {
        if (nonFullscreenNextKeys.includes(e.key)) {
          e.preventDefault()
          nextSlide()
        } else if (nonFullscreenPrevKeys.includes(e.key)) {
          e.preventDefault()
          prevSlide()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen, endSlideshow])

  // Click to advance in fullscreen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fullscreenRef.current && !fullscreenRef.current.contains(event.target as Node)) {
        nextSlide()
      }
    }

    if (isFullscreen) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [isFullscreen, fullscreenRef])

  const handleShare = () => {
    console.log("[v0] Share clicked")
    // Share functionality placeholder
  }

  const currentSlideIndex = editorState.slides.findIndex((slide) => slide.id === editorState.currentSlideId)

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800 overflow-hidden">
      {/* Header */}
      {showHeader && (
        <SlideHeader
          title={title}
          setTitle={setTitle}
          onStartSlideshow={startSlideshow}
          slides={editorState.slides}
          currentSlide={getCurrentSlide()}
          onImport={handleImport}
          onTemplateSelect={handleTemplateSelect}
          onShare={handleShare}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SlideSidebar
          slides={editorState.slides}
          currentSlideId={editorState.currentSlideId}
          onSlideSelect={setCurrentSlide}
          onSlideAdd={addSlide}
          onSlideDelete={deleteSlide}
          onSlideDuplicate={duplicateSlide}
          onSlideRename={renameSlide}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <SlideViewer />

          {/* Bottom Controls */}
          <SlideControls
            currentSlide={currentSlideIndex + 1}
            totalSlides={editorState.slides.length}
            onPrevSlide={prevSlide}
            onNextSlide={nextSlide}
            onSlideChange={(slideNumber) => {
              const slideIndex = slideNumber - 1
              if (slideIndex >= 0 && slideIndex < editorState.slides.length) {
                setCurrentSlide(editorState.slides[slideIndex].id)
              }
            }}
          />
        </div>
      </div>

      {/* Fullscreen Slideshow */}
      <FullscreenSlideshow
        slide={getCurrentSlide()}
        isVisible={isFullscreen || isTransitioning}
        showSlide={showSlide}
        fullscreenRef={fullscreenRef}
        onNextSlide={nextSlide}
      />
    </div>
  )
}
