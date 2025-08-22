"use client"

import React from "react"

import { useCallback, useState } from "react"
import type { Element, Point } from "@/types/slide"

interface ElementResizeHandlesProps {
  element: Element
  zoom: number
  onElementUpdate: (elementId: string, updates: Partial<Element>) => void
}

export function ElementResizeHandles({ element, zoom, onElementUpdate }: ElementResizeHandlesProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [startTransform, setStartTransform] = useState(element.transform)

  const handleSize = 8 / zoom
  const { x, y, width, height } = element.transform

  const handles = [
    { id: "nw", x: x - handleSize / 2, y: y - handleSize / 2, cursor: "nw-resize" },
    { id: "n", x: x + width / 2 - handleSize / 2, y: y - handleSize / 2, cursor: "n-resize" },
    { id: "ne", x: x + width - handleSize / 2, y: y - handleSize / 2, cursor: "ne-resize" },
    { id: "e", x: x + width - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: "e-resize" },
    { id: "se", x: x + width - handleSize / 2, y: y + height - handleSize / 2, cursor: "se-resize" },
    { id: "s", x: x + width / 2 - handleSize / 2, y: y + height - handleSize / 2, cursor: "s-resize" },
    { id: "sw", x: x - handleSize / 2, y: y + height - handleSize / 2, cursor: "sw-resize" },
    { id: "w", x: x - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: "w-resize" },
  ]

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handleId: string) => {
      e.stopPropagation()
      setIsResizing(true)
      setResizeHandle(handleId)
      setStartPoint({ x: e.clientX, y: e.clientY })
      setStartTransform(element.transform)
    },
    [element.transform],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeHandle || !startPoint) return

      const deltaX = (e.clientX - startPoint.x) / zoom
      const deltaY = (e.clientY - startPoint.y) / zoom

      const newTransform = { ...startTransform }

      switch (resizeHandle) {
        case "nw":
          newTransform.x = startTransform.x + deltaX
          newTransform.y = startTransform.y + deltaY
          newTransform.width = startTransform.width - deltaX
          newTransform.height = startTransform.height - deltaY
          break
        case "n":
          newTransform.y = startTransform.y + deltaY
          newTransform.height = startTransform.height - deltaY
          break
        case "ne":
          newTransform.y = startTransform.y + deltaY
          newTransform.width = startTransform.width + deltaX
          newTransform.height = startTransform.height - deltaY
          break
        case "e":
          newTransform.width = startTransform.width + deltaX
          break
        case "se":
          newTransform.width = startTransform.width + deltaX
          newTransform.height = startTransform.height + deltaY
          break
        case "s":
          newTransform.height = startTransform.height + deltaY
          break
        case "sw":
          newTransform.x = startTransform.x + deltaX
          newTransform.width = startTransform.width - deltaX
          newTransform.height = startTransform.height + deltaY
          break
        case "w":
          newTransform.x = startTransform.x + deltaX
          newTransform.width = startTransform.width - deltaX
          break
      }

      // Ensure minimum size
      if (newTransform.width < 10) {
        newTransform.width = 10
        if (resizeHandle.includes("w")) {
          newTransform.x = startTransform.x + startTransform.width - 10
        }
      }
      if (newTransform.height < 10) {
        newTransform.height = 10
        if (resizeHandle.includes("n")) {
          newTransform.y = startTransform.y + startTransform.height - 10
        }
      }

      onElementUpdate(element.id, { transform: newTransform })
    },
    [isResizing, resizeHandle, startPoint, startTransform, zoom, element.id, onElementUpdate],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setResizeHandle(null)
    setStartPoint(null)
  }, [])

  // Add global event listeners when resizing
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  return (
    <g>
      {handles.map((handle) => (
        <rect
          key={handle.id}
          x={handle.x}
          y={handle.y}
          width={handleSize}
          height={handleSize}
          fill="#3b82f6"
          stroke="#ffffff"
          strokeWidth={1 / zoom}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => handleMouseDown(e as any, handle.id)}
        />
      ))}

      {/* Rotation handle */}
      <circle
        cx={x + width / 2}
        cy={y - 20 / zoom}
        r={4 / zoom}
        fill="#10b981"
        stroke="#ffffff"
        strokeWidth={1 / zoom}
        style={{ cursor: "grab" }}
      />
      <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y - 16 / zoom} stroke="#10b981" strokeWidth={2 / zoom} />
    </g>
  )
}
