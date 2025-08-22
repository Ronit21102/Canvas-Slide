"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Square,
  Circle,
  Triangle,
  Diamond,
  Pentagon,
  Hexagon,
  Star,
  Heart,
  Cloud,
  MessageCircle,
  MessageSquare,
  MapPin,
  Flag,
  Shield,
} from "lucide-react"

interface ShapeLibraryPanelProps {
  onShapeSelect: (shapeType: string) => void
  selectedTool: string
}

export function ShapeLibraryPanel({ onShapeSelect, selectedTool }: ShapeLibraryPanelProps) {
  const basicShapes = [
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
    { id: "triangle", icon: Triangle, label: "Triangle" },
    { id: "diamond", icon: Diamond, label: "Diamond" },
  ]

  const polygonShapes = [
    { id: "pentagon", icon: Pentagon, label: "Pentagon" },
    { id: "hexagon", icon: Hexagon, label: "Hexagon" },
    { id: "star", icon: Star, label: "Star" },
  ]

  const specialShapes = [
    { id: "heart", icon: Heart, label: "Heart" },
    { id: "cloud", icon: Cloud, label: "Cloud" },
    { id: "shield", icon: Shield, label: "Shield" },
  ]

  const calloutShapes = [
    { id: "speech-bubble", icon: MessageCircle, label: "Speech Bubble" },
    { id: "thought-bubble", icon: MessageSquare, label: "Thought Bubble" },
    { id: "callout", icon: MapPin, label: "Callout" },
    { id: "banner", icon: Flag, label: "Banner" },
  ]

  const renderShapeGroup = (title: string, shapes: typeof basicShapes) => (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((shape) => {
          const Icon = shape.icon
          return (
            <Button
              key={shape.id}
              variant={selectedTool === shape.id ? "default" : "outline"}
              size="sm"
              onClick={() => onShapeSelect(shape.id)}
              className="h-12 flex flex-col items-center justify-center gap-1 text-xs"
              title={shape.label}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{shape.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-4">Shape Library</h3>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6">
          {renderShapeGroup("Basic Shapes", basicShapes)}
          <Separator />
          {renderShapeGroup("Polygons", polygonShapes)}
          <Separator />
          {renderShapeGroup("Special Shapes", specialShapes)}
          <Separator />
          {renderShapeGroup("Callouts", calloutShapes)}
        </div>
      </ScrollArea>
    </div>
  )
}
