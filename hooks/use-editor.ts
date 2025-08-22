"use client"

import { useState, useCallback, useRef } from "react"
import type { EditorState, Slide, Element, Point, CanvasState, HistoryState, GroupElement } from "@/types/slide"
import { initialSlides } from "@/data/slides"
import { generateElementId, getSelectionBounds } from "@/lib/element-utils"

const initialCanvasState: CanvasState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedElements: [],
  clipboard: [],
  gridEnabled: true,
  snapToGrid: true,
  gridSize: 20,
}

export function useEditor() {
  const [editorState, setEditorState] = useState<EditorState>({
    slides: initialSlides,
    currentSlideId: initialSlides[0]?.id || "",
    canvasState: initialCanvasState,
    history: [],
    historyIndex: -1,
    tool: "select",
    isDrawing: false,
  })

  const historyRef = useRef<HistoryState[]>([])

  // Save state to history
  const saveToHistory = useCallback(() => {
    const historyState: HistoryState = {
      slides: JSON.parse(JSON.stringify(editorState.slides)),
      currentSlideId: editorState.currentSlideId,
      canvasState: JSON.parse(JSON.stringify(editorState.canvasState)),
    }

    historyRef.current = historyRef.current.slice(0, editorState.historyIndex + 1)
    historyRef.current.push(historyState)

    setEditorState((prev) => ({
      ...prev,
      history: historyRef.current,
      historyIndex: historyRef.current.length - 1,
    }))
  }, [editorState.slides, editorState.currentSlideId, editorState.canvasState, editorState.historyIndex])

  // Get current slide
  const getCurrentSlide = useCallback((): Slide | undefined => {
    return editorState.slides.find((slide) => slide.id === editorState.currentSlideId)
  }, [editorState.slides, editorState.currentSlideId])

  // Update slide
  const updateSlide = useCallback((slideId: string, updates: Partial<Slide>) => {
    setEditorState((prev) => ({
      ...prev,
      slides: prev.slides.map((slide) =>
        slide.id === slideId ? { ...slide, ...updates, updatedAt: new Date() } : slide,
      ),
    }))
  }, [])

  // Add element to current slide
  const addElement = useCallback(
    (element: Element) => {
      const currentSlide = getCurrentSlide()
      if (!currentSlide) return

      const updatedElements = [...currentSlide.elements, element]
      updateSlide(currentSlide.id, { elements: updatedElements })
      saveToHistory()
    },
    [getCurrentSlide, updateSlide, saveToHistory],
  )

  // Update element
  const updateElement = useCallback(
    (elementId: string, updates: Partial<Element>) => {
      const currentSlide = getCurrentSlide()
      if (!currentSlide) return

      const updatedElements = currentSlide.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element,
      )
      updateSlide(currentSlide.id, { elements: updatedElements })
    },
    [getCurrentSlide, updateSlide],
  )

  // Delete elements
  const deleteElements = useCallback(
    (elementIds: string[]) => {
      const currentSlide = getCurrentSlide()
      if (!currentSlide) return

      const updatedElements = currentSlide.elements.filter((element) => !elementIds.includes(element.id))
      updateSlide(currentSlide.id, { elements: updatedElements })

      setEditorState((prev) => ({
        ...prev,
        canvasState: {
          ...prev.canvasState,
          selectedElements: prev.canvasState.selectedElements.filter((id) => !elementIds.includes(id)),
        },
      }))
      saveToHistory()
    },
    [getCurrentSlide, updateSlide, saveToHistory],
  )

  // Canvas operations
  const setZoom = useCallback((zoom: number) => {
    setEditorState((prev) => ({
      ...prev,
      canvasState: { ...prev.canvasState, zoom: Math.max(0.1, Math.min(5, zoom)) },
    }))
  }, [])

  const setPan = useCallback((pan: Point) => {
    setEditorState((prev) => ({
      ...prev,
      canvasState: { ...prev.canvasState, pan },
    }))
  }, [])

  const setSelectedElements = useCallback((elementIds: string[]) => {
    setEditorState((prev) => ({
      ...prev,
      canvasState: { ...prev.canvasState, selectedElements: elementIds },
    }))
  }, [])

  const setTool = useCallback((tool: EditorState["tool"]) => {
    setEditorState((prev) => ({ ...prev, tool }))
  }, [])

  // Slide operations
  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: `Slide ${editorState.slides.length + 1}`,
      elements: [],
      background: { type: "color", value: "#ffffff" },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setEditorState((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
      currentSlideId: newSlide.id,
    }))
    saveToHistory()
  }, [editorState.slides.length, saveToHistory])

  const deleteSlide = useCallback(
    (slideId: string) => {
      if (editorState.slides.length <= 1) return

      const slideIndex = editorState.slides.findIndex((slide) => slide.id === slideId)
      const updatedSlides = editorState.slides.filter((slide) => slide.id !== slideId)

      let newCurrentSlideId = editorState.currentSlideId
      if (slideId === editorState.currentSlideId) {
        const newIndex = Math.min(slideIndex, updatedSlides.length - 1)
        newCurrentSlideId = updatedSlides[newIndex]?.id || updatedSlides[0]?.id
      }

      setEditorState((prev) => ({
        ...prev,
        slides: updatedSlides,
        currentSlideId: newCurrentSlideId,
      }))
      saveToHistory()
    },
    [editorState.slides, editorState.currentSlideId, saveToHistory],
  )

  const duplicateSlide = useCallback(
    (slideId: string) => {
      const slideToDuplicate = editorState.slides.find((slide) => slide.id === slideId)
      if (!slideToDuplicate) return

      const duplicatedSlide: Slide = {
        ...JSON.parse(JSON.stringify(slideToDuplicate)),
        id: `slide-${Date.now()}`,
        title: `${slideToDuplicate.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Update element IDs to avoid conflicts
      duplicatedSlide.elements = duplicatedSlide.elements.map((element) => ({
        ...element,
        id: `${element.id}-copy-${Date.now()}`,
      }))

      const slideIndex = editorState.slides.findIndex((slide) => slide.id === slideId)
      const updatedSlides = [
        ...editorState.slides.slice(0, slideIndex + 1),
        duplicatedSlide,
        ...editorState.slides.slice(slideIndex + 1),
      ]

      setEditorState((prev) => ({
        ...prev,
        slides: updatedSlides,
        currentSlideId: duplicatedSlide.id,
      }))
      saveToHistory()
    },
    [editorState.slides, saveToHistory],
  )

  const setCurrentSlide = useCallback((slideId: string) => {
    setEditorState((prev) => ({
      ...prev,
      currentSlideId: slideId,
      canvasState: {
        ...prev.canvasState,
        selectedElements: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
      },
    }))
  }, [])

  const renameSlide = useCallback(
    (slideId: string, newTitle: string) => {
      updateSlide(slideId, { title: newTitle })
      saveToHistory()
    },
    [updateSlide, saveToHistory],
  )

  // Undo/Redo
  const undo = useCallback(() => {
    if (editorState.historyIndex > 0) {
      const previousState = historyRef.current[editorState.historyIndex - 1]
      setEditorState((prev) => ({
        ...prev,
        slides: previousState.slides,
        currentSlideId: previousState.currentSlideId,
        canvasState: previousState.canvasState,
        historyIndex: prev.historyIndex - 1,
      }))
    }
  }, [editorState.historyIndex])

  const redo = useCallback(() => {
    if (editorState.historyIndex < historyRef.current.length - 1) {
      const nextState = historyRef.current[editorState.historyIndex + 1]
      setEditorState((prev) => ({
        ...prev,
        slides: nextState.slides,
        currentSlideId: nextState.currentSlideId,
        canvasState: nextState.canvasState,
        historyIndex: prev.historyIndex + 1,
      }))
    }
  }, [editorState.historyIndex])

  // Element layer management functions
  const moveElementLayer = useCallback(
    (elementId: string, direction: "up" | "down") => {
      const currentSlide = getCurrentSlide()
      if (!currentSlide) return

      const elementIndex = currentSlide.elements.findIndex((el) => el.id === elementId)
      if (elementIndex === -1) return

      const element = currentSlide.elements[elementIndex]
      const newZIndex = direction === "up" ? element.zIndex + 1 : element.zIndex - 1

      // Ensure zIndex stays within bounds
      const maxZIndex = Math.max(...currentSlide.elements.map((el) => el.zIndex))
      const minZIndex = Math.min(...currentSlide.elements.map((el) => el.zIndex))

      if (newZIndex > maxZIndex || newZIndex < minZIndex) return

      // Swap zIndex with element at target position
      const targetElement = currentSlide.elements.find((el) => el.zIndex === newZIndex)
      if (targetElement) {
        updateElement(targetElement.id, { zIndex: element.zIndex })
      }
      updateElement(elementId, { zIndex: newZIndex })
      saveToHistory()
    },
    [getCurrentSlide, updateElement, saveToHistory],
  )

  // Element duplication function
  const duplicateElements = useCallback(
    (elementIds: string[]) => {
      const currentSlide = getCurrentSlide()
      if (!currentSlide) return

      const elementsToDuplicate = currentSlide.elements.filter((el) =>
        editorState.canvasState.selectedElements.includes(el.id),
      )

      const duplicatedElements = elementsToDuplicate.map((element) => ({
        ...JSON.parse(JSON.stringify(element)),
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transform: {
          ...element.transform,
          x: element.transform.x + 20,
          y: element.transform.y + 20,
        },
        zIndex: Math.max(...currentSlide.elements.map((el) => el.zIndex)) + 1,
      }))

      const updatedElements = [...currentSlide.elements, ...duplicatedElements]
      updateSlide(currentSlide.id, { elements: updatedElements })

      // Select the duplicated elements
      setSelectedElements(duplicatedElements.map((el) => el.id))
      saveToHistory()
    },
    [getCurrentSlide, updateSlide, setSelectedElements, saveToHistory],
  )

  // Copy/Paste/Cut operations
  const copyElements = useCallback(() => {
    const currentSlide = getCurrentSlide()
    if (!currentSlide) return

    const elementsToCopy = currentSlide.elements.filter((el) =>
      editorState.canvasState.selectedElements.includes(el.id),
    )

    setEditorState((prev) => ({
      ...prev,
      canvasState: {
        ...prev.canvasState,
        clipboard: JSON.parse(JSON.stringify(elementsToCopy)),
      },
    }))
  }, [getCurrentSlide, editorState.canvasState.selectedElements])

  const pasteElements = useCallback(() => {
    const currentSlide = getCurrentSlide()
    if (!currentSlide || editorState.canvasState.clipboard.length === 0) return

    const pastedElements = editorState.canvasState.clipboard.map((element) => ({
      ...JSON.parse(JSON.stringify(element)),
      id: generateElementId(element.type),
      transform: {
        ...element.transform,
        x: element.transform.x + 20,
        y: element.transform.y + 20,
      },
      zIndex: Math.max(...currentSlide.elements.map((el) => el.zIndex)) + 1,
    }))

    const updatedElements = [...currentSlide.elements, ...pastedElements]
    updateSlide(currentSlide.id, { elements: updatedElements })
    setSelectedElements(pastedElements.map((el) => el.id))
    saveToHistory()
  }, [getCurrentSlide, editorState.canvasState.clipboard, updateSlide, setSelectedElements, saveToHistory])

  const cutElements = useCallback(() => {
    copyElements()
    deleteElements(editorState.canvasState.selectedElements)
  }, [copyElements, deleteElements, editorState.canvasState.selectedElements])

  // Select all elements
  const selectAllElements = useCallback(() => {
    const currentSlide = getCurrentSlide()
    if (!currentSlide) return

    setSelectedElements(currentSlide.elements.map((el) => el.id))
  }, [getCurrentSlide, setSelectedElements])

  // Group/Ungroup operations
  const groupElements = useCallback(() => {
    const currentSlide = getCurrentSlide()
    if (!currentSlide || editorState.canvasState.selectedElements.length < 2) return

    const elementsToGroup = currentSlide.elements.filter((el) =>
      editorState.canvasState.selectedElements.includes(el.id),
    )

    const bounds = getSelectionBounds(elementsToGroup)
    if (!bounds) return

    const groupElement: GroupElement = {
      id: generateElementId("group"),
      type: "group",
      children: elementsToGroup.map((el) => el.id),
      transform: {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      zIndex: Math.max(...elementsToGroup.map((el) => el.zIndex)),
      locked: false,
      visible: true,
      opacity: 1,
    }

    const updatedElements = [
      ...currentSlide.elements.filter((el) => !editorState.canvasState.selectedElements.includes(el.id)),
      groupElement,
    ]

    updateSlide(currentSlide.id, { elements: updatedElements })
    setSelectedElements([groupElement.id])
    saveToHistory()
  }, [getCurrentSlide, editorState.canvasState.selectedElements, updateSlide, setSelectedElements, saveToHistory])

  const ungroupElements = useCallback(() => {
    const currentSlide = getCurrentSlide()
    if (!currentSlide) return

    const selectedGroups = currentSlide.elements.filter(
      (el) => editorState.canvasState.selectedElements.includes(el.id) && el.type === "group",
    ) as GroupElement[]

    if (selectedGroups.length === 0) return

    let updatedElements = [...currentSlide.elements]
    const newSelectedElements: string[] = []

    selectedGroups.forEach((group) => {
      // Remove the group element
      updatedElements = updatedElements.filter((el) => el.id !== group.id)

      // Add back the child elements
      const childElements = currentSlide.elements.filter((el) => group.children.includes(el.id))
      updatedElements.push(...childElements)
      newSelectedElements.push(...group.children)
    })

    updateSlide(currentSlide.id, { elements: updatedElements })
    setSelectedElements(newSelectedElements)
    saveToHistory()
  }, [getCurrentSlide, editorState.canvasState.selectedElements, updateSlide, setSelectedElements, saveToHistory])

  return {
    editorState,
    setEditorState, // Added setEditorState to return object for import functionality
    getCurrentSlide,
    addElement,
    updateElement,
    deleteElements,
    duplicateElements,
    moveElementLayer,
    setZoom,
    setPan,
    setSelectedElements,
    setTool,
    addSlide,
    deleteSlide,
    duplicateSlide,
    renameSlide,
    setCurrentSlide,
    undo,
    redo,
    saveToHistory,
    copyElements,
    pasteElements,
    cutElements,
    selectAllElements,
    groupElements,
    ungroupElements,
  }
}
