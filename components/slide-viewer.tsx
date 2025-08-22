"use client"

import { CanvasEditor } from "./canvas-editor"
import { CanvasToolbar } from "./canvas-toolbar"
import { ElementPropertiesPanel } from "./element-properties-panel"
import { ImageUploadDialog } from "./image-upload-dialog"
import { ShapeLibraryPanel } from "./shape-library-panel"
import { useEditor } from "@/hooks/use-editor"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Shapes } from "lucide-react"
import type { Element } from "@/types/slide"

export function SlideViewer() {
  const {
    editorState,
    getCurrentSlide,
    updateElement,
    addElement,
    deleteElements,
    duplicateElements,
    moveElementLayer,
    setZoom,
    setPan,
    setSelectedElements,
    setTool,
    undo,
    redo,
    copyElements,
    pasteElements,
    cutElements,
    selectAllElements,
    groupElements,
    ungroupElements,
  } = useEditor()

  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showShapeLibrary, setShowShapeLibrary] = useState(false)
  const [prevSlideId, setPrevSlideId] = useState<string | null>(null)

  const currentSlide = getCurrentSlide()

  useEffect(() => {
    if (currentSlide && currentSlide.id !== prevSlideId) {
      console.log("[v0] Slide changed from", prevSlideId, "to", currentSlide.id)
      setSelectedElements([])
      // Reset zoom and pan when switching slides for better UX
      setZoom(1)
      setPan({ x: 0, y: 0 })
      setPrevSlideId(currentSlide.id)
    }
  }, [currentSlide, prevSlideId, setSelectedElements, setZoom, setPan])

  useKeyboardShortcuts({
    editorState,
    onCopy: copyElements,
    onPaste: pasteElements,
    onCut: cutElements,
    onDelete: () => deleteElements(editorState.canvasState.selectedElements),
    onUndo: undo,
    onRedo: redo,
    onSelectAll: selectAllElements,
    onDuplicate: () => duplicateElements(editorState.canvasState.selectedElements),
    onGroup: groupElements,
    onUngroup: ungroupElements,
    onBringForward: () => {
      editorState.canvasState.selectedElements.forEach((id) => moveElementLayer(id, "up"))
    },
    onSendBackward: () => {
      editorState.canvasState.selectedElements.forEach((id) => moveElementLayer(id, "down"))
    },
  })

  if (!currentSlide) {
    return (
      <div className="flex-1 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No slide selected</p>
      </div>
    )
  }

  const handleZoomIn = () => {
    setZoom(editorState.canvasState.zoom * 1.2)
  }

  const handleZoomOut = () => {
    setZoom(editorState.canvasState.zoom / 1.2)
  }

  const handleToggleGrid = () => {
    // This would need to be implemented in the editor state
    console.log("[v0] Toggle grid clicked")
  }

  const handleImageUpload = () => {
    setShowImageUpload(true)
  }

  const handleImageSelect = (src: string, alt?: string) => {
    const newImage: Element = {
      id: `image-${Date.now()}`,
      type: "image",
      src,
      alt: alt || "Uploaded image",
      fit: "cover",
      transform: {
        x: 100,
        y: 100,
        width: 200,
        height: 150,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      zIndex: currentSlide.elements.length,
      locked: false,
      visible: true,
      opacity: 1,
    }

    addElement(newImage)
    setSelectedElements([newImage.id])
  }

  const handleShapeSelect = (shapeType: string) => {
    setTool(shapeType as any)
    setShowShapeLibrary(false)
  }

  return (
    <div className="flex-1 bg-gray-200 flex">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <CanvasToolbar
            tool={editorState.tool}
            zoom={editorState.canvasState.zoom}
            gridEnabled={editorState.canvasState.gridEnabled}
            canUndo={editorState.historyIndex > 0}
            canRedo={editorState.historyIndex < editorState.history.length - 1}
            onToolChange={setTool}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onToggleGrid={handleToggleGrid}
            onUndo={undo}
            onRedo={redo}
            onImageUpload={handleImageUpload}
          />

          <Button
            variant={showShapeLibrary ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowShapeLibrary(!showShapeLibrary)}
            className="mr-2"
          >
            <Shapes className="h-4 w-4 mr-2" />
            Shapes
          </Button>
        </div>

        <CanvasEditor
          key={currentSlide.id}
          elements={currentSlide.elements}
          selectedElements={editorState.canvasState.selectedElements}
          zoom={editorState.canvasState.zoom}
          pan={editorState.canvasState.pan}
          tool={editorState.tool}
          gridEnabled={editorState.canvasState.gridEnabled}
          snapToGrid={editorState.canvasState.snapToGrid}
          gridSize={editorState.canvasState.gridSize}
          onElementUpdate={updateElement}
          onSelectionChange={setSelectedElements}
          onPanChange={setPan}
          onElementCreate={addElement}
        />
      </div>

      <ElementPropertiesPanel
        selectedElements={currentSlide.elements.filter((el) =>
          editorState.canvasState.selectedElements.includes(el.id),
        )}
        onElementUpdate={updateElement}
        onElementDelete={deleteElements}
        onElementDuplicate={duplicateElements}
        onElementLayerChange={moveElementLayer}
      />

      {showShapeLibrary && <ShapeLibraryPanel onShapeSelect={handleShapeSelect} selectedTool={editorState.tool} />}

      <ImageUploadDialog open={showImageUpload} onOpenChange={setShowImageUpload} onImageSelect={handleImageSelect} />
    </div>
  )
}
