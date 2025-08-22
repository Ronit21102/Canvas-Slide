"use client"

import type { Element } from "@/types/slide"

interface AlignmentGuidesProps {
  elements: Element[]
  selectedElements: string[]
  draggedElement?: Element | null
  zoom: number
  snapThreshold?: number
}

export function AlignmentGuides({
  elements,
  selectedElements,
  draggedElement,
  zoom,
  snapThreshold = 8,
}: AlignmentGuidesProps) {
  if (!draggedElement || selectedElements.length === 0) return null

  const guides: Array<{ x1: number; y1: number; x2: number; y2: number; type: "vertical" | "horizontal" }> = []
  const otherElements = elements.filter((el) => !selectedElements.includes(el.id))

  const draggedBounds = {
    left: draggedElement.transform.x,
    right: draggedElement.transform.x + draggedElement.transform.width,
    top: draggedElement.transform.y,
    bottom: draggedElement.transform.y + draggedElement.transform.height,
    centerX: draggedElement.transform.x + draggedElement.transform.width / 2,
    centerY: draggedElement.transform.y + draggedElement.transform.height / 2,
  }

  otherElements.forEach((element) => {
    const bounds = {
      left: element.transform.x,
      right: element.transform.x + element.transform.width,
      top: element.transform.y,
      bottom: element.transform.y + element.transform.height,
      centerX: element.transform.x + element.transform.width / 2,
      centerY: element.transform.y + element.transform.height / 2,
    }

    if (Math.abs(draggedBounds.left - bounds.left) < snapThreshold) {
      guides.push({
        x1: bounds.left,
        y1: Math.min(draggedBounds.top, bounds.top) - 30,
        x2: bounds.left,
        y2: Math.max(draggedBounds.bottom, bounds.bottom) + 30,
        type: "vertical",
      })
    }
    if (Math.abs(draggedBounds.right - bounds.right) < snapThreshold) {
      guides.push({
        x1: bounds.right,
        y1: Math.min(draggedBounds.top, bounds.top) - 30,
        x2: bounds.right,
        y2: Math.max(draggedBounds.bottom, bounds.bottom) + 30,
        type: "vertical",
      })
    }
    if (Math.abs(draggedBounds.centerX - bounds.centerX) < snapThreshold) {
      guides.push({
        x1: bounds.centerX,
        y1: Math.min(draggedBounds.top, bounds.top) - 30,
        x2: bounds.centerX,
        y2: Math.max(draggedBounds.bottom, bounds.bottom) + 30,
        type: "vertical",
      })
    }
    if (Math.abs(draggedBounds.left - bounds.right) < snapThreshold) {
      guides.push({
        x1: bounds.right,
        y1: Math.min(draggedBounds.top, bounds.top) - 20,
        x2: bounds.right,
        y2: Math.max(draggedBounds.bottom, bounds.bottom) + 20,
        type: "vertical",
      })
    }
    if (Math.abs(draggedBounds.right - bounds.left) < snapThreshold) {
      guides.push({
        x1: bounds.left,
        y1: Math.min(draggedBounds.top, bounds.top) - 20,
        x2: bounds.left,
        y2: Math.max(draggedBounds.bottom, bounds.bottom) + 20,
        type: "vertical",
      })
    }

    if (Math.abs(draggedBounds.top - bounds.top) < snapThreshold) {
      guides.push({
        x1: Math.min(draggedBounds.left, bounds.left) - 30,
        y1: bounds.top,
        x2: Math.max(draggedBounds.right, bounds.right) + 30,
        y2: bounds.top,
        type: "horizontal",
      })
    }
    if (Math.abs(draggedBounds.bottom - bounds.bottom) < snapThreshold) {
      guides.push({
        x1: Math.min(draggedBounds.left, bounds.left) - 30,
        y1: bounds.bottom,
        x2: Math.max(draggedBounds.right, bounds.right) + 30,
        y2: bounds.bottom,
        type: "horizontal",
      })
    }
    if (Math.abs(draggedBounds.centerY - bounds.centerY) < snapThreshold) {
      guides.push({
        x1: Math.min(draggedBounds.left, bounds.left) - 30,
        y1: bounds.centerY,
        x2: Math.max(draggedBounds.right, bounds.right) + 30,
        y2: bounds.centerY,
        type: "horizontal",
      })
    }
    if (Math.abs(draggedBounds.top - bounds.bottom) < snapThreshold) {
      guides.push({
        x1: Math.min(draggedBounds.left, bounds.left) - 20,
        y1: bounds.bottom,
        x2: Math.max(draggedBounds.right, bounds.right) + 20,
        y2: bounds.bottom,
        type: "horizontal",
      })
    }
    if (Math.abs(draggedBounds.bottom - bounds.top) < snapThreshold) {
      guides.push({
        x1: Math.min(draggedBounds.left, bounds.left) - 20,
        y1: bounds.top,
        x2: Math.max(draggedBounds.right, bounds.right) + 20,
        y2: bounds.top,
        type: "horizontal",
      })
    }
  })

  return (
    <g>
      {guides.map((guide, index) => (
        <line
          key={index}
          x1={guide.x1}
          y1={guide.y1}
          x2={guide.x2}
          y2={guide.y2}
          stroke="#3b82f6"
          strokeWidth={1.5 / zoom}
          strokeDasharray={`${3 / zoom} ${2 / zoom}`}
          opacity={0.9}
        />
      ))}
    </g>
  )
}
