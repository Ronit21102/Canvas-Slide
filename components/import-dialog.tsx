"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, FileText, AlertCircle } from "lucide-react"
import type { Slide } from "@/types/slide"
import { importFromJSON } from "@/lib/export-utils"

interface ImportDialogProps {
  onImport: (slides: Slide[]) => void
}

export function ImportDialog({ onImport }: ImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError(null)

    try {
      const text = await file.text()
      const importedSlides = importFromJSON(text)

      onImport(importedSlides)
      setIsOpen(false)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to import file")
    } finally {
      setIsImporting(false)
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()

    const file = event.dataTransfer.files[0]
    if (!file) return

    if (!file.name.endsWith(".json")) {
      setError("Please select a JSON file")
      return
    }

    setIsImporting(true)
    setError(null)

    try {
      const text = await file.text()
      const importedSlides = importFromJSON(text)

      onImport(importedSlides)
      setIsOpen(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to import file")
    } finally {
      setIsImporting(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Moodboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">Import a previously exported JSON file to restore your moodboard.</div>

          {/* Drop Zone */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Drop your JSON file here</p>
              <p className="text-xs text-gray-500">or click to browse</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isImporting && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 mt-2">Importing...</p>
            </div>
          )}

          {/* Manual File Selection */}
          <div className="pt-4 border-t">
            <Label htmlFor="file-input" className="text-sm font-medium">
              Or select file manually:
            </Label>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full mt-2"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose JSON File
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
