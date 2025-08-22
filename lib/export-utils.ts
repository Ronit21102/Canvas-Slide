import type { Slide } from "@/types/slide"

export interface ExportOptions {
  format: "json" | "png" | "pdf"
  quality?: number
  scale?: number
  includeBackground?: boolean
}

export function exportToJSON(slides: Slide[]): string {
  const exportData = {
    version: "1.0",
    createdAt: new Date().toISOString(),
    slides: slides.map((slide) => ({
      ...slide,
      createdAt: slide.createdAt.toISOString(),
      updatedAt: slide.updatedAt.toISOString(),
    })),
  }

  return JSON.stringify(exportData, null, 2)
}

export function importFromJSON(jsonString: string): Slide[] {
  try {
    const data = JSON.parse(jsonString)

    if (!data.slides || !Array.isArray(data.slides)) {
      throw new Error("Invalid JSON format: missing slides array")
    }

    return data.slides.map((slide: any) => ({
      ...slide,
      createdAt: new Date(slide.createdAt),
      updatedAt: new Date(slide.updatedAt),
    }))
  } catch (error) {
    throw new Error(`Failed to import JSON: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function exportToPNG(slide: Slide, options: ExportOptions = {}): Promise<string> {
  const { scale = 2, includeBackground = true } = options
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("Failed to get canvas context")
  }

  // Set canvas size (standard slide dimensions)
  const width = 1920 * scale
  const height = 1080 * scale
  canvas.width = width
  canvas.height = height

  // Set background
  if (includeBackground) {
    ctx.fillStyle = slide.background.value
    ctx.fillRect(0, 0, width, height)
  }

  // Render elements
  const sortedElements = slide.elements.slice().sort((a, b) => a.zIndex - b.zIndex)

  for (const element of sortedElements) {
    if (!element.visible) continue

    ctx.save()
    ctx.globalAlpha = element.opacity

    const transform = element.transform
    const x = transform.x * scale
    const y = transform.y * scale
    const w = transform.width * scale
    const h = transform.height * scale

    // Apply rotation if needed
    if (transform.rotation !== 0) {
      const centerX = x + w / 2
      const centerY = y + h / 2
      ctx.translate(centerX, centerY)
      ctx.rotate((transform.rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
    }

    if (element.type === "shape") {
      ctx.fillStyle = element.fill
      ctx.strokeStyle = element.stroke
      ctx.lineWidth = element.strokeWidth * scale

      if (element.shapeType === "rectangle" || element.shapeType === "sticky-note") {
        const radius = (element.cornerRadius || 0) * scale

        if (radius > 0) {
          // Rounded rectangle
          ctx.beginPath()
          ctx.moveTo(x + radius, y)
          ctx.lineTo(x + w - radius, y)
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
          ctx.lineTo(x + w, y + h - radius)
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
          ctx.lineTo(x + radius, y + h)
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
          ctx.lineTo(x, y + radius)
          ctx.quadraticCurveTo(x, y, x + radius, y)
          ctx.closePath()
        } else {
          ctx.rect(x, y, w, h)
        }

        ctx.fill()
        if (element.strokeWidth > 0) ctx.stroke()
      } else if (element.shapeType === "circle") {
        ctx.beginPath()
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI)
        ctx.fill()
        if (element.strokeWidth > 0) ctx.stroke()
      }
    } else if (element.type === "text") {
      ctx.fillStyle = element.color
      ctx.font = `${element.fontStyle} ${element.fontWeight} ${element.fontSize * scale}px ${element.fontFamily}`
      ctx.textAlign = element.textAlign as CanvasTextAlign
      ctx.textBaseline = "top"

      // Handle background color
      if (element.backgroundColor && element.backgroundColor !== "transparent") {
        ctx.fillStyle = element.backgroundColor
        ctx.fillRect(x, y, w, h)
        ctx.fillStyle = element.color
      }

      // Simple text rendering (multi-line would need more complex handling)
      const lines = element.content.split("\n")
      const lineHeight = element.fontSize * scale * 1.2

      lines.forEach((line, index) => {
        let textX = x
        if (element.textAlign === "center") textX = x + w / 2
        else if (element.textAlign === "right") textX = x + w

        ctx.fillText(line, textX, y + index * lineHeight)
      })
    } else if (element.type === "image" && element.src) {
      // For images, we'd need to load them first
      // This is a simplified version
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = element.src
        })

        ctx.drawImage(img, x, y, w, h)
      } catch (error) {
        // Fallback: draw a placeholder rectangle
        ctx.fillStyle = "#f3f4f6"
        ctx.strokeStyle = "#d1d5db"
        ctx.lineWidth = 1
        ctx.fillRect(x, y, w, h)
        ctx.strokeRect(x, y, w, h)

        // Draw "Image" text
        ctx.fillStyle = "#6b7280"
        ctx.font = `${16 * scale}px Inter`
        ctx.textAlign = "center"
        ctx.fillText("Image", x + w / 2, y + h / 2)
      }
    }

    ctx.restore()
  }

  return canvas.toDataURL("image/png", options.quality || 0.9)
}

export async function exportToPDF(slides: Slide[], options: ExportOptions = {}): Promise<Blob> {
  // For a full PDF implementation, you'd typically use a library like jsPDF
  // This is a simplified version that creates a multi-page PDF-like structure

  const pngDataUrls: string[] = []

  for (const slide of slides) {
    const pngData = await exportToPNG(slide, options)
    pngDataUrls.push(pngData)
  }

  // Create a simple PDF-like blob (in a real implementation, use jsPDF)
  const pdfContent = {
    pages: pngDataUrls,
    metadata: {
      title: "Moodboard Export",
      creator: "v0 Moodboard Editor",
      createdAt: new Date().toISOString(),
    },
  }

  return new Blob([JSON.stringify(pdfContent)], { type: "application/json" })
}

export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function generateFilename(baseName: string, format: string): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-")
  return `${baseName}-${timestamp}.${format}`
}
