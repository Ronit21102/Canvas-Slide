"use client"

import { useEffect, useCallback } from "react"
import type { EditorState } from "@/types/slide"

interface UseKeyboardShortcutsProps {
  editorState: EditorState
  onCopy: () => void
  onPaste: () => void
  onCut: () => void
  onDelete: () => void
  onUndo: () => void
  onRedo: () => void
  onSelectAll: () => void
  onDuplicate: () => void
  onGroup: () => void
  onUngroup: () => void
  onBringForward: () => void
  onSendBackward: () => void
}

export function useKeyboardShortcuts({
  editorState,
  onCopy,
  onPaste,
  onCut,
  onDelete,
  onUndo,
  onRedo,
  onSelectAll,
  onDuplicate,
  onGroup,
  onUngroup,
  onBringForward,
  onSendBackward,
}: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey

      // Copy
      if (cmdOrCtrl && e.key === "c" && !e.shiftKey) {
        e.preventDefault()
        onCopy()
      }
      // Paste
      else if (cmdOrCtrl && e.key === "v" && !e.shiftKey) {
        e.preventDefault()
        onPaste()
      }
      // Cut
      else if (cmdOrCtrl && e.key === "x" && !e.shiftKey) {
        e.preventDefault()
        onCut()
      }
      // Delete
      else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        onDelete()
      }
      // Undo
      else if (cmdOrCtrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        onUndo()
      }
      // Redo
      else if (cmdOrCtrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        onRedo()
      }
      // Select All
      else if (cmdOrCtrl && e.key === "a") {
        e.preventDefault()
        onSelectAll()
      }
      // Duplicate
      else if (cmdOrCtrl && e.key === "d") {
        e.preventDefault()
        onDuplicate()
      }
      // Group
      else if (cmdOrCtrl && e.key === "g" && !e.shiftKey) {
        e.preventDefault()
        onGroup()
      }
      // Ungroup
      else if (cmdOrCtrl && e.key === "g" && e.shiftKey) {
        e.preventDefault()
        onUngroup()
      }
      // Bring Forward
      else if (cmdOrCtrl && e.key === "]") {
        e.preventDefault()
        onBringForward()
      }
      // Send Backward
      else if (cmdOrCtrl && e.key === "[") {
        e.preventDefault()
        onSendBackward()
      }
    },
    [
      onCopy,
      onPaste,
      onCut,
      onDelete,
      onUndo,
      onRedo,
      onSelectAll,
      onDuplicate,
      onGroup,
      onUngroup,
      onBringForward,
      onSendBackward,
    ],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}
