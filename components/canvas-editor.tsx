"use client"

import type React from "react"
import { ElementResizeHandles } from "./element-resize-handles"
import { MultiSelectBox } from "./multi-select-box"
import { AlignmentGuides } from "./alignment-guides"
import { TextEditor } from "./text-editor"
import { renderShapePath, isCustomShape } from "@/lib/shape-renderer"

import { useRef, useCallback, useState, useEffect } from "react"
import type { Element, Point } from "@/types/slide"
import { isPointInElement, snapPointToGrid } from "@/lib/element-utils"

interface CanvasEditorProps {
  elements: Element[]
  selectedElements: string[]
  zoom: number
  pan: Point
  tool: string
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number
  slideId?: string // Added slideId prop to track slide changes
  onElementUpdate: (elementId: string, updates: Partial<Element>) => void
  onSelectionChange: (elementIds: string[]) => void
  onPanChange: (pan: Point) => void
  onElementCreate: (element: Element) => void
}

export function CanvasEditor({
  elements,
  selectedElements,
  zoom,
  pan,
  tool,
  gridEnabled,
  snapToGrid,
  gridSize,
  slideId, // Added slideId parameter
  onElementUpdate,
  onSelectionChange,
  onPanChange,
  onElementCreate,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Point | null>(null)
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 })
  const [isCreating, setIsCreating] = useState(false)
  const [isMultiSelecting, setIsMultiSelecting] = useState(false)
  const [multiSelectStart, setMultiSelectStart] = useState<Point | null>(null)
  const [multiSelectCurrent, setMultiSelectCurrent] = useState<Point | null>(null)
  const [draggedElement, setDraggedElement] = useState<Element | null>(null)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [isDraggingMultiple, setIsDraggingMultiple] = useState(false)

  useEffect(() => {
    console.log("[v0] Canvas editor slide changed to:", slideId)
    console.log("[v0] Canvas editor elements:", elements.length)

    // Clear all interaction states when slide changes
    setIsDragging(false)
    setIsCreating(false)
    setIsMultiSelecting(false)
    setIsDraggingMultiple(false)
    setDragStart(null)
    setMultiSelectStart(null)
    setMultiSelectCurrent(null)
    setDraggedElement(null)
    setEditingTextId(null)
    setDragOffset({ x: 0, y: 0 })

    // Clear selection when switching slides
    onSelectionChange([])
  }, [slideId, onSelectionChange])

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenPoint: Point): Point => {
      if (!canvasRef.current) return screenPoint
      const rect = canvasRef.current.getBoundingClientRect()
      return {
        x: (screenPoint.x - rect.left - pan.x) / zoom,
        y: (screenPoint.y - rect.top - pan.y) / zoom,
      }
    },
    [zoom, pan],
  )

  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback(
    (canvasPoint: Point): Point => {
      return {
        x: canvasPoint.x * zoom + pan.x,
        y: canvasPoint.y * zoom + pan.y,
      }
    },
    [zoom, pan],
  )

  const getElementsInSelectionBox = useCallback(
    (start: Point, end: Point): string[] => {
      const minX = Math.min(start.x, end.x)
      const maxX = Math.max(start.x, end.x)
      const minY = Math.min(start.y, end.y)
      const maxY = Math.max(start.y, end.y)

      return elements
        .filter((element) => {
          const { x, y, width, height } = element.transform
          return x >= minX && y >= minY && x + width <= maxX && y + height <= maxY
        })
        .map((element) => element.id)
    },
    [elements],
  )

  // Handle mouse down
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!canvasRef.current) return

      const canvasPoint = screenToCanvas({ x: e.clientX, y: e.clientY })

      if (tool === "select") {
        // Find element under cursor
        const clickedElement = elements
          .slice()
          .reverse()
          .find((element) => isPointInElement(canvasPoint, element))

        if (clickedElement) {
          // Handle element selection
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            // Multi-select with Shift/Ctrl/Cmd
            if (selectedElements.includes(clickedElement.id)) {
              onSelectionChange(selectedElements.filter((id) => id !== clickedElement.id))
            } else {
              onSelectionChange([...selectedElements, clickedElement.id])
            }
          } else if (!selectedElements.includes(clickedElement.id)) {
            onSelectionChange([clickedElement.id])
          }

          const elementsToMove = selectedElements.includes(clickedElement.id) ? selectedElements : [clickedElement.id]

          setIsDraggingMultiple(elementsToMove.length > 1)
          setIsDragging(true)
          setDragStart(canvasPoint)
          setDraggedElement(clickedElement)
          setDragOffset({
            x: canvasPoint.x - clickedElement.transform.x,
            y: canvasPoint.y - clickedElement.transform.y,
          })
        } else {
          // Click on empty space - start multi-select or clear selection
          if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
            onSelectionChange([])
          }

          setIsMultiSelecting(true)
          setMultiSelectStart(canvasPoint)
          setMultiSelectCurrent(canvasPoint)
        }
      } else {
        // Creating new element
        setIsCreating(true)
        setDragStart(canvasPoint)
      }
    },
    [tool, elements, selectedElements, screenToCanvas, onSelectionChange],
  )

  // Handle mouse move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvasPoint = screenToCanvas({ x: e.clientX, y: e.clientY })

      if (tool === "select") {
        if (isDragging && dragStart && selectedElements.length > 0) {
          const deltaX = canvasPoint.x - dragStart.x
          const deltaY = canvasPoint.y - dragStart.y

          selectedElements.forEach((elementId) => {
            const element = elements.find((el) => el.id === elementId)
            if (!element) return

            let newX = element.transform.x + deltaX
            let newY = element.transform.y + deltaY

            if (snapToGrid) {
              const snapped = snapPointToGrid({ x: newX, y: newY }, gridSize)
              newX = snapped.x
              newY = snapped.y
            }

            onElementUpdate(elementId, {
              transform: { ...element.transform, x: newX, y: newY },
            })
          })

          setDragStart(canvasPoint)
        } else if (isMultiSelecting && multiSelectStart) {
          setMultiSelectCurrent(canvasPoint)

          // Update selection based on current box
          const elementsInBox = getElementsInSelectionBox(multiSelectStart, canvasPoint)
          onSelectionChange(elementsInBox)
        }
      } else if (isCreating) {
        // Show preview of element being created
        // This will be handled by the preview overlay
      }
    },
    [
      screenToCanvas,
      tool,
      isDragging,
      dragStart,
      selectedElements,
      elements,
      snapToGrid,
      gridSize,
      onElementUpdate,
      isMultiSelecting,
      multiSelectStart,
      getElementsInSelectionBox,
      onSelectionChange,
      isCreating,
    ],
  )

  // Handle mouse up
  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (isCreating && dragStart) {
        const canvasPoint = screenToCanvas({ x: e.clientX, y: e.clientY })

        // Create new element based on tool
        if (tool !== "select") {
          const width = Math.abs(canvasPoint.x - dragStart.x)
          const height = Math.abs(canvasPoint.y - dragStart.y)

          if (width > 10 && height > 10) {
            // Minimum size threshold
            const x = Math.min(dragStart.x, canvasPoint.x)
            const y = Math.min(dragStart.y, canvasPoint.y)

            let newElement: Element | null = null

            if (tool === "rectangle") {
              newElement = {
                id: `shape-${Date.now()}`,
                type: "shape",
                shapeType: "rectangle",
                transform: { x, y, width, height, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: elements.length,
                locked: false,
                visible: true,
                opacity: 1,
                fill: "#3b82f6",
                stroke: "#1e40af",
                strokeWidth: 2,
                cornerRadius: 4,
              }
            } else if (tool === "circle") {
              newElement = {
                id: `shape-${Date.now()}`,
                type: "shape",
                shapeType: "circle",
                transform: { x, y, width, height, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: elements.length,
                locked: false,
                visible: true,
                opacity: 1,
                fill: "#10b981",
                stroke: "#059669",
                strokeWidth: 2,
              }
            } else if (tool === "text") {
              newElement = {
                id: `text-${Date.now()}`,
                type: "text",
                content: "Double-click to edit",
                transform: { x, y, width, height, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: elements.length,
                locked: false,
                visible: true,
                opacity: 1,
                fontSize: 16,
                fontFamily: "Inter",
                fontWeight: "normal",
                fontStyle: "normal",
                textDecoration: "none",
                textAlign: "left",
                color: "#1f2937",
              }
            } else if (tool === "sticky-note") {
              newElement = {
                id: `shape-${Date.now()}`,
                type: "shape",
                shapeType: "sticky-note",
                transform: { x, y, width, height, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: elements.length,
                locked: false,
                visible: true,
                opacity: 1,
                fill: "#fef3c7",
                stroke: "#f59e0b",
                strokeWidth: 1,
                cornerRadius: 4,
              }
            } else if (
              [
                "triangle",
                "diamond",
                "pentagon",
                "hexagon",
                "star",
                "heart",
                "cloud",
                "speech-bubble",
                "thought-bubble",
                "callout",
                "banner",
                "shield",
              ].includes(tool)
            ) {
              // Color scheme for different shape categories
              const shapeColors = {
                triangle: { fill: "#ef4444", stroke: "#dc2626" },
                diamond: { fill: "#8b5cf6", stroke: "#7c3aed" },
                pentagon: { fill: "#f59e0b", stroke: "#d97706" },
                hexagon: { fill: "#06b6d4", stroke: "#0891b2" },
                star: { fill: "#eab308", stroke: "#ca8a04" },
                heart: { fill: "#ec4899", stroke: "#db2777" },
                cloud: { fill: "#94a3b8", stroke: "#64748b" },
                "speech-bubble": { fill: "#ffffff", stroke: "#374151" },
                "thought-bubble": { fill: "#f3f4f6", stroke: "#6b7280" },
                callout: { fill: "#fef3c7", stroke: "#f59e0b" },
                banner: { fill: "#ddd6fe", stroke: "#8b5cf6" },
                shield: { fill: "#bbf7d0", stroke: "#16a34a" },
              }

              const colors = shapeColors[tool as keyof typeof shapeColors] || { fill: "#3b82f6", stroke: "#1e40af" }

              newElement = {
                id: `shape-${Date.now()}`,
                type: "shape",
                shapeType: tool as any,
                transform: { x, y, width, height, rotation: 0, scaleX: 1, scaleY: 1 },
                zIndex: elements.length,
                locked: false,
                visible: true,
                opacity: 1,
                fill: colors.fill,
                stroke: colors.stroke,
                strokeWidth: 2,
              }
            }

            if (newElement) {
              onElementCreate(newElement)
              onSelectionChange([newElement.id])
            }
          }
        }
      }

      setIsDragging(false)
      setIsCreating(false)
      setIsMultiSelecting(false)
      setIsDraggingMultiple(false)
      setDragStart(null)
      setMultiSelectStart(null)
      setMultiSelectCurrent(null)
      setDraggedElement(null)
      setDragOffset({ x: 0, y: 0 })
    },
    [isCreating, dragStart, screenToCanvas, tool, elements, onElementCreate, onSelectionChange],
  )

  // Handle double-click
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (tool !== "select") return

      const canvasPoint = screenToCanvas({ x: e.clientX, y: e.clientY })
      const clickedElement = elements
        .slice()
        .reverse()
        .find((element) => isPointInElement(canvasPoint, element))

      if (clickedElement && clickedElement.type === "text") {
        setEditingTextId(clickedElement.id)
        onSelectionChange([clickedElement.id])
      }
    },
    [tool, elements, screenToCanvas, onSelectionChange],
  )

  // Render grid
  const renderGrid = () => {
    if (!gridEnabled) return null

    const gridLines = []
    const canvasWidth = 2000
    const canvasHeight = 2000

    // Vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
      gridLines.push(
        <line key={`v-${x}`} x1={x} y1={0} x2={x} y2={canvasHeight} stroke="#e5e7eb" strokeWidth={1 / zoom} />,
      )
    }

    // Horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
      gridLines.push(
        <line key={`h-${y}`} x1={0} y1={y} x2={canvasWidth} y2={y} stroke="#e5e7eb" strokeWidth={1 / zoom} />,
      )
    }

    return gridLines
  }

  // Render element
  const renderElement = (element: Element) => {
    const { transform } = element
    const isSelected = selectedElements.includes(element.id)
    const isMultiSelected = isSelected && selectedElements.length > 1

    if (element.type === "shape") {
      if (isCustomShape(element.shapeType)) {
        const pathData = renderShapePath(element)
        return (
          <g key={element.id}>
            <g transform={`translate(${transform.x}, ${transform.y})`}>
              <path
                d={pathData}
                fill={element.fill}
                stroke={element.stroke}
                strokeWidth={element.strokeWidth / zoom}
                opacity={element.opacity}
                transform={`rotate(${transform.rotation} ${transform.width / 2} ${transform.height / 2})`}
              />
            </g>
            {isSelected && (
              <>
                <rect
                  x={transform.x - 2 / zoom}
                  y={transform.y - 2 / zoom}
                  width={transform.width + 4 / zoom}
                  height={transform.height + 4 / zoom}
                  fill="none"
                  stroke={isMultiSelected ? "#10b981" : "#3b82f6"}
                  strokeWidth={2 / zoom}
                  strokeDasharray={`${4 / zoom} ${4 / zoom}`}
                />
                <ElementResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
              </>
            )}
          </g>
        )
      } else if (element.shapeType === "rectangle" || element.shapeType === "sticky-note") {
        return (
          <g key={element.id}>
            <rect
              x={transform.x}
              y={transform.y}
              width={transform.width}
              height={transform.height}
              fill={element.fill}
              stroke={element.stroke}
              strokeWidth={element.strokeWidth / zoom}
              rx={element.cornerRadius || 0}
              opacity={element.opacity}
              transform={`rotate(${transform.rotation} ${transform.x + transform.width / 2} ${transform.y + transform.height / 2})`}
            />
            {isSelected && (
              <>
                <rect
                  x={transform.x - 2 / zoom}
                  y={transform.y - 2 / zoom}
                  width={transform.width + 4 / zoom}
                  height={transform.height + 4 / zoom}
                  fill="none"
                  stroke={isMultiSelected ? "#10b981" : "#3b82f6"}
                  strokeWidth={2 / zoom}
                  strokeDasharray={`${4 / zoom} ${4 / zoom}`}
                />
                <ElementResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
              </>
            )}
          </g>
        )
      } else if (element.shapeType === "circle") {
        const cx = transform.x + transform.width / 2
        const cy = transform.y + transform.height / 2
        const rx = transform.width / 2
        const ry = transform.height / 2

        return (
          <g key={element.id}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={element.fill}
              stroke={element.stroke}
              strokeWidth={element.strokeWidth / zoom}
              opacity={element.opacity}
            />
            {isSelected && (
              <>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx + 2 / zoom}
                  ry={ry + 2 / zoom}
                  fill="none"
                  stroke={isMultiSelected ? "#10b981" : "#3b82f6"}
                  strokeWidth={2 / zoom}
                  strokeDasharray={`${4 / zoom} ${4 / zoom}`}
                />
                <ElementResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
              </>
            )}
          </g>
        )
      }
    } else if (element.type === "text") {
      return (
        <g key={element.id}>
          <foreignObject x={transform.x} y={transform.y} width={transform.width} height={transform.height}>
            <div
              style={{
                fontSize: element.fontSize / zoom,
                fontFamily: element.fontFamily,
                fontWeight: element.fontWeight,
                fontStyle: element.fontStyle,
                textDecoration: element.textDecoration,
                textAlign: element.textAlign,
                color: element.color,
                backgroundColor: element.backgroundColor,
                width: "100%",
                height: "100%",
                padding: `${4 / zoom}px`,
                boxSizing: "border-box",
                opacity: element.opacity,
              }}
            >
              {element.content}
            </div>
          </foreignObject>
          {isSelected && (
            <>
              <rect
                x={transform.x - 2 / zoom}
                y={transform.y - 2 / zoom}
                width={transform.width + 4 / zoom}
                height={transform.height + 4 / zoom}
                fill="none"
                stroke={isMultiSelected ? "#10b981" : "#3b82f6"}
                strokeWidth={2 / zoom}
                strokeDasharray={`${4 / zoom} ${4 / zoom}`}
              />
              <ElementResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
            </>
          )}
        </g>
      )
    } else if (element.type === "image") {
      return (
        <g key={element.id}>
          <foreignObject x={transform.x} y={transform.y} width={transform.width} height={transform.height}>
            <img
              src={element.src || "/placeholder.svg"}
              alt={element.alt || ""}
              style={{
                width: "100%",
                height: "100%",
                objectFit: element.fit,
                opacity: element.opacity,
              }}
            />
          </foreignObject>
          {isSelected && (
            <>
              <rect
                x={transform.x - 2 / zoom}
                y={transform.y - 2 / zoom}
                width={transform.width + 4 / zoom}
                height={transform.height + 4 / zoom}
                fill="none"
                stroke={isMultiSelected ? "#10b981" : "#3b82f6"}
                strokeWidth={2 / zoom}
                strokeDasharray={`${4 / zoom} ${4 / zoom}`}
              />
              <ElementResizeHandles element={element} zoom={zoom} onElementUpdate={onElementUpdate} />
            </>
          )}
        </g>
      )
    }

    return null
  }

  return (
    <div className="flex-1 bg-gray-100 overflow-hidden relative">
      <div
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{ cursor: tool === "select" ? "default" : "crosshair" }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${(canvasRef.current?.clientWidth || 800) / zoom} ${(canvasRef.current?.clientHeight || 600) / zoom}`}
          className="w-full h-full"
        >
          {/* Grid */}
          {renderGrid()}

          {/* Elements */}
          {elements
            .slice()
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderElement)}

          <MultiSelectBox
            isActive={isMultiSelecting}
            startPoint={multiSelectStart}
            currentPoint={multiSelectCurrent}
            zoom={zoom}
            pan={pan}
          />

          <AlignmentGuides
            elements={elements}
            selectedElements={selectedElements}
            draggedElement={draggedElement}
            zoom={zoom}
          />

          {/* Creation preview */}
          {isCreating && dragStart && (
            <rect
              x={Math.min(dragStart.x, dragStart.x)}
              y={Math.min(dragStart.y, dragStart.y)}
              width={Math.abs(0)}
              height={Math.abs(0)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2 / zoom}
              strokeDasharray={`${4 / zoom} ${4 / zoom}`}
              opacity={0.5}
            />
          )}
        </svg>
      </div>

      {selectedElements.length > 1 && (
        <div className="absolute top-4 left-4 bg-green-100 border border-green-300 rounded-lg px-3 py-2 text-sm font-medium text-green-800">
          {selectedElements.length} elements selected
        </div>
      )}

      {/* Text editor overlay */}
      {editingTextId && (
        <TextEditor
          element={elements.find((el) => el.id === editingTextId)!}
          zoom={zoom}
          onUpdate={(updates) => onElementUpdate(editingTextId, updates)}
          onFinish={() => setEditingTextId(null)}
        />
      )}
    </div>
  )
}
