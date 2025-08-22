"use client"

import { Button } from "@/components/ui/button"
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Search,
  Undo,
  Redo,
  Printer,
  Palette,
  MousePointer2,
  Type,
  Shapes,
  Minus,
  Highlighter,
  Video,
} from "lucide-react"
import { ImageIcon } from "lucide-react"

interface SlideToolbarProps {
  showHeader: boolean
  setShowHeader: (show: boolean) => void
  onAddSlide: () => void
}

export function SlideToolbar({ showHeader, setShowHeader, onAddSlide }: SlideToolbarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-300">
      <div className="flex items-center space-x-1 overflow-x-auto">
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onAddSlide}>
          <Plus className="h-4 w-4" />
        </Button>
        <div className="w-1 h-6 border-l border-slate-300" />
        <Button variant="ghost" size="icon">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Printer className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Palette className="h-4 w-4" />
        </Button>
        <select className="bg-transparent border-none text-sm w-20 flex">
          <option>Fit</option>
          <option>100%</option>
          <option>75%</option>
          <option>50%</option>
          <option>25%</option>
        </select>
        <div className="w-1 h-6 border-l border-slate-300" />
        <Button variant="ghost" size="icon">
          <MousePointer2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Type className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Shapes className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Highlighter className="h-4 w-4" />
        </Button>
        <div className="w-1 h-6 border-l border-slate-300" />
        <Button variant="ghost" size="sm">
          Background
        </Button>
        <div className="w-1 h-6 border-l border-slate-300" />
        <Button variant="ghost" size="sm">
          Layout
        </Button>
        <div className="w-1 h-6 border-l border-slate-300" />
        <Button variant="ghost" size="sm">
          Theme
        </Button>
        <div className="w-1 h-6 border-l border-slate-300" />
        <Button variant="ghost" size="sm">
          Transition
        </Button>
      </div>
      <div className="flex items-center">
        <Button variant="ghost" size="icon">
          <Video className="h-4 w-4" />
        </Button>
        <div className="font-semibold text-sm">Rec</div>
        <Button variant="ghost" size="icon" onClick={() => setShowHeader(!showHeader)} className="ml-6">
          {showHeader ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="ml-6 h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}
