"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Plus, Minus, Hand, MousePointer2 } from "lucide-react"

interface SlideControlsProps {
  currentSlide: number
  totalSlides: number
  onPrevSlide: () => void
  onNextSlide: () => void
  onSlideChange: (slideNumber: number) => void
}

export function SlideControls({
  currentSlide,
  totalSlides,
  onPrevSlide,
  onNextSlide,
  onSlideChange,
}: SlideControlsProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-t border-gray-300">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <MousePointer2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Hand className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" onClick={onPrevSlide}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={currentSlide}
          onChange={(e) => onSlideChange(Number(e.target.value))}
          className="w-16 text-center"
        />
        <span>/ {totalSlides}</span>
        <Button variant="ghost" size="icon" onClick={onNextSlide}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Minus className="h-4 w-4" />
        </Button>
        <select className="bg-transparent border-none text-sm">
          <option>100%</option>
        </select>
        <Button variant="ghost" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
