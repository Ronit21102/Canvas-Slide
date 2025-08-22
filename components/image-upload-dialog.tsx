"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Link, Search } from "lucide-react"

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageSelect: (src: string, alt?: string) => void
}

export function ImageUploadDialog({ open, onOpenChange, onImageSelect }: ImageUploadDialogProps) {
  const [urlInput, setUrlInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Create a data URL for the uploaded file
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onImageSelect(result, file.name)
        onOpenChange(false)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading file:", error)
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageSelect(urlInput.trim())
      onOpenChange(false)
      setUrlInput("")
    }
  }

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      // Generate placeholder image with search query
      const placeholderUrl = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(searchQuery)}`
      onImageSelect(placeholderUrl, searchQuery)
      onOpenChange(false)
      setSearchQuery("")
    }
  }

  const stockImages = [
    { src: "/business-meeting-collaboration.png", alt: "Business Meeting" },
    { src: "/serene-mountain-lake.png", alt: "Nature Landscape" },
    { src: "/technology-abstract.png", alt: "Technology Abstract" },
    { src: "/team-collaboration.png", alt: "Team Collaboration" },
    { src: "/data-visualization-abstract.png", alt: "Data Visualization" },
    { src: "/creative-workspace.png", alt: "Creative Workspace" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>Upload an image file, paste a URL, or search for stock images.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="stock">Stock Images</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Upload an image</p>
              <p className="text-sm text-gray-500 mb-4">PNG, JPG, GIF up to 10MB</p>
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="mb-2">
                {isUploading ? "Uploading..." : "Choose File"}
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                />
                <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                  <Link className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">Search Images</Label>
              <div className="flex gap-2">
                <Input
                  id="search-query"
                  placeholder="Search for images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                />
                <Button onClick={handleSearchSubmit} disabled={!searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {stockImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onImageSelect(image.src, image.alt)
                    onOpenChange(false)
                  }}
                  className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors"
                >
                  <img src={image.src || "/placeholder.svg"} alt={image.alt} className="w-full h-20 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
