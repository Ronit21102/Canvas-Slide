"use client"
import type { Point } from "@/types/slide"

interface MultiSelectBoxProps {
  isActive: boolean
  startPoint: Point | null
  currentPoint: Point | null
  zoom: number
  pan: Point
}

export function MultiSelectBox({ isActive, startPoint, currentPoint, zoom, pan }: MultiSelectBoxProps) {
  if (!isActive || !startPoint || !currentPoint) return null

  const x = Math.min(startPoint.x, currentPoint.x)
  const y = Math.min(startPoint.y, currentPoint.y)
  const width = Math.abs(currentPoint.x - startPoint.x)
  const height = Math.abs(currentPoint.y - startPoint.y)

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(59, 130, 246, 0.1)"
      stroke="#3b82f6"
      strokeWidth={1 / zoom}
      strokeDasharray={`${4 / zoom} ${4 / zoom}`}
    />
  )
}
