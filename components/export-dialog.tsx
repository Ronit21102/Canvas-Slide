"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Download, FileText, ImageIcon, FileImage } from "lucide-react"
import type { Slide } from "@/types/slide"
import { exportToJSON, exportToPNG, exportToPDF, downloadFile, generateFilename } from "@/lib/export-utils"

interface ExportDialogProps {
  slides: Slide[]
  currentSlide?: Slide
  projectTitle: string
}

export function ExportDialog({ slides, currentSlide, projectTitle }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<"json" | "png" | "pdf">("json")
  const [exportScope, setExportScope] = useState<"current" | "all">("all")
  const [quality, setQuality] = useState([90])
  const [scale, setScale] = useState([2])
  const [includeBackground, setIncludeBackground] = useState(true)
  const [customFilename, setCustomFilename] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const slidesToExport = exportScope === "current" && currentSlide ? [currentSlide] : slides
      const baseFilename = customFilename || projectTitle || "moodboard"

      if (format === "json") {
        const jsonContent = exportToJSON(slidesToExport)
        const filename = generateFilename(baseFilename, "json")
        downloadFile(jsonContent, filename, "application/json")
      } else if (format === "png") {
        if (slidesToExport.length === 1) {
          // Single PNG
          const pngData = await exportToPNG(slidesToExport[0], {
            format: "png",
            quality: quality[0] / 100,
            scale: scale[0],
            includeBackground,
          })

          const filename = generateFilename(baseFilename, "png")

          // Convert data URL to blob
          const response = await fetch(pngData)
          const blob = await response.blob()
          downloadFile(blob, filename, "image/png")
        } else {
          // Multiple PNGs - create a zip would be ideal, but for now download individually
          for (let i = 0; i < slidesToExport.length; i++) {
            const slide = slidesToExport[i]
            const pngData = await exportToPNG(slide, {
              format: "png",
              quality: quality[0] / 100,
              scale: scale[0],
              includeBackground,
            })

            const filename = generateFilename(`${baseFilename}-slide-${i + 1}`, "png")

            const response = await fetch(pngData)
            const blob = await response.blob()
            downloadFile(blob, filename, "image/png")

            // Small delay between downloads
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        }
      } else if (format === "pdf") {
        const pdfBlob = await exportToPDF(slidesToExport, {
          format: "pdf",
          quality: quality[0] / 100,
          scale: scale[0],
          includeBackground,
        })

        const filename = generateFilename(baseFilename, "pdf")
        downloadFile(pdfBlob, filename, "application/pdf")
      }

      setIsOpen(false)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const getFormatIcon = () => {
    switch (format) {
      case "json":
        return <FileText className="h-4 w-4" />
      case "png":
        return <ImageIcon className="h-4 w-4" />
      case "pdf":
        return <FileImage className="h-4 w-4" />
    }
  }

  const getFormatDescription = () => {
    switch (format) {
      case "json":
        return "Export as JSON file to preserve all data and import later"
      case "png":
        return "Export as high-quality PNG image(s)"
      case "pdf":
        return "Export as PDF document"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Moodboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(value: "json" | "png" | "pdf") => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    JSON (Data)
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    PNG (Image)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileImage className="h-4 w-4" />
                    PDF (Document)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">{getFormatDescription()}</p>
          </div>

          {/* Export Scope */}
          <div className="space-y-2">
            <Label>Export Scope</Label>
            <Select value={exportScope} onValueChange={(value: "current" | "all") => setExportScope(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Slide Only</SelectItem>
                <SelectItem value="all">All Slides ({slides.length})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image-specific options */}
          {(format === "png" || format === "pdf") && (
            <>
              <div className="space-y-2">
                <Label>Quality ({quality[0]}%)</Label>
                <Slider value={quality} onValueChange={setQuality} max={100} min={10} step={10} className="w-full" />
              </div>

              <div className="space-y-2">
                <Label>Scale ({scale[0]}x)</Label>
                <Slider value={scale} onValueChange={setScale} max={4} min={1} step={0.5} className="w-full" />
                <p className="text-xs text-gray-500">Higher scale = larger file size but better quality</p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="include-background" checked={includeBackground} onCheckedChange={setIncludeBackground} />
                <Label htmlFor="include-background" className="text-sm">
                  Include background
                </Label>
              </div>
            </>
          )}

          {/* Custom filename */}
          <div className="space-y-2">
            <Label>Filename (optional)</Label>
            <Input
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={projectTitle || "moodboard"}
            />
            <p className="text-xs text-gray-500">
              Leave empty to use project title. Timestamp will be added automatically.
            </p>
          </div>

          {/* Export Button */}
          <Button onClick={handleExport} disabled={isExporting} className="w-full">
            {isExporting ? (
              "Exporting..."
            ) : (
              <>
                {getFormatIcon()}
                <span className="ml-2">Export as {format.toUpperCase()}</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
