"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, Copy, Trash2, Edit3 } from "lucide-react"
import type { Slide } from "@/types/slide"

interface SlideSidebarProps {
  slides: Slide[]
  currentSlideId: string
  onSlideSelect: (slideId: string) => void
  onSlideAdd: () => void
  onSlideDelete: (slideId: string) => void
  onSlideDuplicate: (slideId: string) => void
  onSlideRename: (slideId: string, newTitle: string) => void
}

export function SlideSidebar({
  slides,
  currentSlideId,
  onSlideSelect,
  onSlideAdd,
  onSlideDelete,
  onSlideDuplicate,
  onSlideRename,
}: SlideSidebarProps) {
  const slidePreviewRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  useEffect(() => {
    const currentSlideIndex = slides.findIndex((slide) => slide.id === currentSlideId)
    const activeSlidePreview = slidePreviewRefs.current[currentSlideIndex]
    if (activeSlidePreview && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      const scrollAreaRect = scrollArea.getBoundingClientRect()
      const activeSlideRect = activeSlidePreview.getBoundingClientRect()

      if (activeSlideRect.top < scrollAreaRect.top) {
        scrollArea.scrollTop -= scrollAreaRect.top - activeSlideRect.top
      } else if (activeSlideRect.bottom > scrollAreaRect.bottom) {
        scrollArea.scrollTop += activeSlideRect.bottom - scrollAreaRect.bottom
      }
    }
  }, [currentSlideId, slides])

  const generateThumbnail = (slide: Slide): string => {
    // Create a simple SVG thumbnail representation
    const elements = slide.elements.slice(0, 5) // Limit to first 5 elements for performance

    const svgElements = elements
      .map((element) => {
        if (element.type === "shape" && element.shapeType === "rectangle") {
          return `<rect x="${element.transform.x / 4}" y="${element.transform.y / 4}" 
                      width="${element.transform.width / 4}" height="${element.transform.height / 4}" 
                      fill="${element.fill}" stroke="${element.stroke}" strokeWidth="0.5"/>`
        } else if (element.type === "shape" && element.shapeType === "circle") {
          const cx = (element.transform.x + element.transform.width / 2) / 4
          const cy = (element.transform.y + element.transform.height / 2) / 4
          const rx = element.transform.width / 8
          const ry = element.transform.height / 8
          return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" 
                         fill="${element.fill}" stroke="${element.stroke}" strokeWidth="0.5"/>`
        } else if (element.type === "text") {
          return `<text x="${element.transform.x / 4}" y="${(element.transform.y + element.fontSize) / 4}" 
                      fontSize="${element.fontSize / 4}" fill="${element.color}" fontFamily="${element.fontFamily}">
                  ${element.content.substring(0, 20)}
                </text>`
        }
        return ""
      })
      .join("")

    const svg = `<svg width="120" height="68" viewBox="0 0 150 85" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="85" fill="${slide.background.value}"/>
      ${svgElements}
    </svg>`

    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  const handleTitleEdit = (slideId: string, currentTitle: string) => {
    setEditingSlideId(slideId)
    setEditingTitle(currentTitle)
  }

  const handleTitleSave = () => {
    if (editingSlideId && editingTitle.trim()) {
      onSlideRename(editingSlideId, editingTitle.trim())
    }
    setEditingSlideId(null)
    setEditingTitle("")
  }

  const handleTitleCancel = () => {
    setEditingSlideId(null)
    setEditingTitle("")
  }

  return (
    <div className="min-w-64 w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-gray-700">Slides</h3>
          <Button variant="ghost" size="sm" onClick={onSlideAdd} className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {slides.length} slide{slides.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Slides List */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-2 space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              ref={(el) => (slidePreviewRefs.current[index] = el)}
              className={`group relative rounded-lg border-2 transition-all cursor-pointer ${
                currentSlideId === slide.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => onSlideSelect(slide.id)}
            >
              {/* Slide Number */}
              <div className="absolute top-2 left-2 z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5 text-xs font-medium text-gray-600">
                  {index + 1}
                </div>
              </div>

              {/* Slide Actions */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 bg-white/90 backdrop-blur-sm hover:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTitleEdit(slide.id, slide.title)
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onSlideDuplicate(slide.id)
                      }}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onSlideDelete(slide.id)
                      }}
                      className="text-red-600 focus:text-red-600"
                      disabled={slides.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Slide Preview */}
              <div className="p-3">
                <div className="rounded overflow-hidden bg-white shadow-sm" style={{ aspectRatio: "16 / 9" }}>
                  <img
                    src={generateThumbnail(slide) || "/placeholder.svg"}
                    alt={`Slide ${index + 1} preview`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Slide Title */}
                <div className="mt-2">
                  {editingSlideId === slide.id ? (
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={handleTitleSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTitleSave()
                        if (e.key === "Escape") handleTitleCancel()
                      }}
                      className="h-6 text-xs"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-xs font-medium text-gray-700 truncate">{slide.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">
                    {slide.elements.length} element{slide.elements.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
