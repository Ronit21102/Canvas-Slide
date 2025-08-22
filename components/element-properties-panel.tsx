"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
} from "lucide-react"
import type { Element, TextElement, ShapeElement, ImageElement } from "@/types/slide"

interface ElementPropertiesPanelProps {
  selectedElements: Element[]
  onElementUpdate: (elementId: string, updates: Partial<Element>) => void
  onElementDelete: (elementIds: string[]) => void
  onElementDuplicate: (elementIds: string[]) => void
  onElementLayerChange: (elementId: string, direction: "up" | "down") => void
}

export function ElementPropertiesPanel({
  selectedElements,
  onElementUpdate,
  onElementDelete,
  onElementDuplicate,
  onElementLayerChange,
}: ElementPropertiesPanelProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  if (selectedElements.length === 0) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <p className="text-sm text-gray-500 text-center">Select an element to edit properties</p>
      </div>
    )
  }

  const element = selectedElements[0] // For now, edit first selected element
  const isMultiSelect = selectedElements.length > 1

  const handleTransformUpdate = (updates: Partial<Element["transform"]>) => {
    selectedElements.forEach((el) => {
      onElementUpdate(el.id, {
        transform: { ...el.transform, ...updates },
      })
    })
  }

  const handlePropertyUpdate = (updates: Partial<Element>) => {
    selectedElements.forEach((el) => {
      onElementUpdate(el.id, updates)
    })
  }

  const renderTextProperties = (textElement: TextElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-content">Content</Label>
        <Input
          id="text-content"
          value={textElement.content}
          onChange={(e) => onElementUpdate(textElement.id, { content: e.target.value })}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="font-size">Font Size</Label>
          <Input
            id="font-size"
            type="number"
            value={textElement.fontSize}
            onChange={(e) => onElementUpdate(textElement.id, { fontSize: Number.parseInt(e.target.value) || 16 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={textElement.fontFamily}
            onValueChange={(value) => onElementUpdate(textElement.id, { fontFamily: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter">Inter</SelectItem>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={textElement.fontWeight === "bold" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            onElementUpdate(textElement.id, {
              fontWeight: textElement.fontWeight === "bold" ? "normal" : "bold",
            })
          }
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={textElement.fontStyle === "italic" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            onElementUpdate(textElement.id, {
              fontStyle: textElement.fontStyle === "italic" ? "normal" : "italic",
            })
          }
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={textElement.textDecoration === "underline" ? "default" : "outline"}
          size="sm"
          onClick={() =>
            onElementUpdate(textElement.id, {
              textDecoration: textElement.textDecoration === "underline" ? "none" : "underline",
            })
          }
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant={textElement.textAlign === "left" ? "default" : "outline"}
          size="sm"
          onClick={() => onElementUpdate(textElement.id, { textAlign: "left" })}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={textElement.textAlign === "center" ? "default" : "outline"}
          size="sm"
          onClick={() => onElementUpdate(textElement.id, { textAlign: "center" })}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={textElement.textAlign === "right" ? "default" : "outline"}
          size="sm"
          onClick={() => onElementUpdate(textElement.id, { textAlign: "right" })}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label htmlFor="text-color">Text Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="text-color"
            type="color"
            value={textElement.color}
            onChange={(e) => onElementUpdate(textElement.id, { color: e.target.value })}
            className="w-12 h-8 p-1"
          />
          <Input
            value={textElement.color}
            onChange={(e) => onElementUpdate(textElement.id, { color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )

  const renderShapeProperties = (shapeElement: ShapeElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fill-color">Fill Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="fill-color"
            type="color"
            value={shapeElement.fill}
            onChange={(e) => onElementUpdate(shapeElement.id, { fill: e.target.value })}
            className="w-12 h-8 p-1"
          />
          <Input
            value={shapeElement.fill}
            onChange={(e) => onElementUpdate(shapeElement.id, { fill: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="stroke-color">Stroke Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="stroke-color"
            type="color"
            value={shapeElement.stroke}
            onChange={(e) => onElementUpdate(shapeElement.id, { stroke: e.target.value })}
            className="w-12 h-8 p-1"
          />
          <Input
            value={shapeElement.stroke}
            onChange={(e) => onElementUpdate(shapeElement.id, { stroke: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="stroke-width">Stroke Width</Label>
        <Input
          id="stroke-width"
          type="number"
          value={shapeElement.strokeWidth}
          onChange={(e) => onElementUpdate(shapeElement.id, { strokeWidth: Number.parseInt(e.target.value) || 1 })}
          className="mt-1"
          min="0"
          max="20"
        />
      </div>

      {shapeElement.shapeType === "rectangle" && (
        <div>
          <Label htmlFor="corner-radius">Corner Radius</Label>
          <Input
            id="corner-radius"
            type="number"
            value={shapeElement.cornerRadius || 0}
            onChange={(e) => onElementUpdate(shapeElement.id, { cornerRadius: Number.parseInt(e.target.value) || 0 })}
            className="mt-1"
            min="0"
            max="50"
          />
        </div>
      )}
    </div>
  )

  const renderImageProperties = (imageElement: ImageElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-src">Image URL</Label>
        <Input
          id="image-src"
          value={imageElement.src}
          onChange={(e) => onElementUpdate(imageElement.id, { src: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="image-alt">Alt Text</Label>
        <Input
          id="image-alt"
          value={imageElement.alt || ""}
          onChange={(e) => onElementUpdate(imageElement.id, { alt: e.target.value })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="image-fit">Object Fit</Label>
        <Select
          value={imageElement.fit}
          onValueChange={(value: "contain" | "cover" | "fill") => onElementUpdate(imageElement.id, { fit: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">
            {isMultiSelect
              ? `${selectedElements.length} Elements`
              : element.type.charAt(0).toUpperCase() + element.type.slice(1)}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onElementDuplicate(selectedElements.map((el) => el.id))}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onElementDelete(selectedElements.map((el) => el.id))}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Element Actions */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePropertyUpdate({ locked: !element.locked })}
            className="flex-1"
          >
            {element.locked ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
            {element.locked ? "Unlock" : "Lock"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePropertyUpdate({ visible: !element.visible })}
            className="flex-1"
          >
            {element.visible ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {element.visible ? "Hide" : "Show"}
          </Button>
        </div>

        {/* Layer Controls */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onElementLayerChange(element.id, "up")} className="flex-1">
            <MoveUp className="h-4 w-4 mr-1" />
            Forward
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onElementLayerChange(element.id, "down")}
            className="flex-1"
          >
            <MoveDown className="h-4 w-4 mr-1" />
            Backward
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="transform">Transform</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="p-4 space-y-4">
            {!isMultiSelect && (
              <>
                {element.type === "text" && renderTextProperties(element as TextElement)}
                {element.type === "shape" && renderShapeProperties(element as ShapeElement)}
                {element.type === "image" && renderImageProperties(element as ImageElement)}
              </>
            )}

            {/* Common Properties */}
            <Separator />
            <div>
              <Label htmlFor="opacity">Opacity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  id="opacity"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[element.opacity]}
                  onValueChange={([value]) => handlePropertyUpdate({ opacity: value })}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">{Math.round(element.opacity * 100)}%</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transform" className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="pos-x">X</Label>
                <Input
                  id="pos-x"
                  type="number"
                  value={Math.round(element.transform.x)}
                  onChange={(e) => handleTransformUpdate({ x: Number.parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pos-y">Y</Label>
                <Input
                  id="pos-y"
                  type="number"
                  value={Math.round(element.transform.y)}
                  onChange={(e) => handleTransformUpdate({ y: Number.parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={Math.round(element.transform.width)}
                  onChange={(e) => handleTransformUpdate({ width: Number.parseInt(e.target.value) || 1 })}
                  className="mt-1"
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={Math.round(element.transform.height)}
                  onChange={(e) => handleTransformUpdate({ height: Number.parseInt(e.target.value) || 1 })}
                  className="mt-1"
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rotation">Rotation</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  id="rotation"
                  min={-180}
                  max={180}
                  step={1}
                  value={[element.transform.rotation]}
                  onValueChange={([value]) => handleTransformUpdate({ rotation: value })}
                  className="flex-1"
                />
                <span className="text-sm w-12 text-right">{element.transform.rotation}°</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
