"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Minus,
  ArrowRight,
  StickyNote,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Undo2,
  Redo2,
} from "lucide-react"

interface CanvasToolbarProps {
  tool: string
  zoom: number
  gridEnabled: boolean
  canUndo: boolean
  canRedo: boolean
  onToolChange: (tool: string) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleGrid: () => void
  onUndo: () => void
  onRedo: () => void
  onImageUpload?: () => void
}

export function CanvasToolbar({
  tool,
  zoom,
  gridEnabled,
  canUndo,
  canRedo,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onUndo,
  onRedo,
  onImageUpload,
}: CanvasToolbarProps) {
  const tools = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "text", icon: Type, label: "Text" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "arrow", icon: ArrowRight, label: "Arrow" },
    { id: "sticky-note", icon: StickyNote, label: "Sticky Note" },
  ]

  return (
    <div className="flex items-center gap-2 p-2 bg-white border-b border-gray-200">
      {/* Undo/Redo */}
      <Button
        variant={canUndo ? "outline" : "ghost"}
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant={canRedo ? "outline" : "ghost"}
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Tools */}
      {tools.map((toolItem) => {
        const Icon = toolItem.icon
        return (
          <Button
            key={toolItem.id}
            variant={tool === toolItem.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onToolChange(toolItem.id)}
            className="h-8 w-8 p-0"
            title={toolItem.label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        )
      })}

      <Button variant="ghost" size="sm" onClick={onImageUpload} className="h-8 w-8 p-0" title="Add Image">
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Zoom */}
      <Button variant="ghost" size="sm" onClick={onZoomOut} className="h-8 w-8 p-0" title="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm font-mono min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
      <Button variant="ghost" size="sm" onClick={onZoomIn} className="h-8 w-8 p-0" title="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Grid */}
      <Button
        variant={gridEnabled ? "default" : "ghost"}
        size="sm"
        onClick={onToggleGrid}
        className="h-8 w-8 p-0"
        title="Toggle Grid"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
    </div>
  )
}
