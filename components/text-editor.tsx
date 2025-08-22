"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { Element } from "@/types/slide"

interface TextEditorProps {
  element: Element
  zoom: number
  onUpdate: (updates: Partial<Element>) => void
  onFinish: () => void
}

export function TextEditor({ element, zoom, onUpdate, onFinish }: TextEditorProps) {
  const [content, setContent] = useState(element.content || "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleFinish()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onFinish()
    }
  }

  const handleFinish = () => {
    onUpdate({ content })
    onFinish()
  }

  const { transform } = element

  return (
    <div
      style={{
        position: "absolute",
        left: transform.x * zoom,
        top: transform.y * zoom,
        width: transform.width * zoom,
        height: transform.height * zoom,
        zIndex: 1000,
      }}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleFinish}
        style={{
          width: "100%",
          height: "100%",
          border: "2px solid #3b82f6",
          borderRadius: "4px",
          padding: "4px",
          fontSize: (element.fontSize || 16) * zoom,
          fontFamily: element.fontFamily || "Inter",
          fontWeight: element.fontWeight || "normal",
          fontStyle: element.fontStyle || "normal",
          textAlign: element.textAlign || "left",
          color: element.color || "#1f2937",
          backgroundColor: element.backgroundColor || "transparent",
          resize: "none",
          outline: "none",
        }}
      />
    </div>
  )
}
