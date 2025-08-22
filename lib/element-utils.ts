import type { Element, Point, Transform } from "@/types/slide"

export function generateElementId(type: string): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function isPointInElement(point: Point, element: Element): boolean {
  const { x, y, width, height } = element.transform
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height
}

export function getElementBounds(element: Element): { x: number; y: number; width: number; height: number } {
  return {
    x: element.transform.x,
    y: element.transform.y,
    width: element.transform.width,
    height: element.transform.height,
  }
}

export function getSelectionBounds(
  elements: Element[],
): { x: number; y: number; width: number; height: number } | null {
  if (elements.length === 0) return null

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  elements.forEach((element) => {
    const bounds = getElementBounds(element)
    minX = Math.min(minX, bounds.x)
    minY = Math.min(minY, bounds.y)
    maxX = Math.max(maxX, bounds.x + bounds.width)
    maxY = Math.max(maxY, bounds.y + bounds.height)
  })

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

export function snapPointToGrid(point: Point, gridSize: number): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  }
}

export function transformElement(element: Element, transform: Partial<Transform>): Element {
  return {
    ...element,
    transform: {
      ...element.transform,
      ...transform,
    },
  }
}

export function duplicateElement(element: Element): Element {
  const duplicated = JSON.parse(JSON.stringify(element))
  duplicated.id = generateElementId(element.type)
  duplicated.transform.x += 20
  duplicated.transform.y += 20
  return duplicated
}

export function getElementCenter(element: Element): Point {
  const { x, y, width, height } = element.transform
  return {
    x: x + width / 2,
    y: y + height / 2,
  }
}

export function rotatePoint(point: Point, center: Point, angle: number): Point {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = point.x - center.x
  const dy = point.y - center.y

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  }
}
