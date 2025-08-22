"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, MessageSquare, Video, Star, Share, Cloud, Layout } from "lucide-react"
import { ExportDialog } from "./export-dialog"
import { ImportDialog } from "./import-dialog"
import { TemplateGallery } from "./template-gallery"
import { useState } from "react"
import type { Slide } from "@/types/slide"
import type { Template } from "@/data/templates"

interface SlideHeaderProps {
  title: string
  setTitle: (title: string) => void
  onStartSlideshow: () => void
  slides: Slide[]
  currentSlide?: Slide
  onImport: (slides: Slide[]) => void
  onTemplateSelect: (template: Template) => void
  onShare?: () => void
}

export function SlideHeader({
  title,
  setTitle,
  onStartSlideshow,
  slides,
  currentSlide,
  onImport,
  onTemplateSelect,
  onShare,
}: SlideHeaderProps) {
  const [showTemplates, setShowTemplates] = useState(false)

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-300">
      <div className="flex items-center space-x-4">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/v0_logo-9AbdOwDkJs8YrE9xmUgmq6rrI7eUGu.png"
          width={0}
          height={48}
          alt="v0 logo"
          className="h-12 w-auto"
        />
        <div>
          <div className="flex items-center">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="font-semibold bg-transparent border-none focus:ring-0 text-lg p-0 w-48"
              placeholder="v0 Moodboard Editor"
            />
            <div className="flex items-center space-x-0.5 ml-0.5">
              <Button variant="ghost" size="icon">
                <Star className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onShare}>
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Cloud className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex space-x-2 text-[13px]">
            <DropdownMenu>
              <DropdownMenuTrigger className="px-1 hover:bg-gray-200 rounded">File</DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowTemplates(true)}>
                  <Layout className="h-4 w-4 mr-2" />
                  Templates
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <ImportDialog onImport={onImport} />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="w-full">
                    <ExportDialog slides={slides} currentSlide={currentSlide} projectTitle={title} />
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="px-1">Edit</span>
            <span className="px-1">View</span>
            <span className="px-1">Insert</span>
            <span className="px-1">Format</span>
            <span className="px-1">Slide</span>
            <span className="px-1">Arrange</span>
            <span className="px-1">Tools</span>
            <span className="px-1">Extensions</span>
            <span className="px-1">Help</span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Clock className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)}>
          <Layout className="h-4 w-4 mr-2" />
          Templates
        </Button>

        <ImportDialog onImport={onImport} />
        <ExportDialog slides={slides} currentSlide={currentSlide} projectTitle={title} />

        <Button variant="outline" className="bg-white text-sm rounded-full ml-2" onClick={onStartSlideshow}>
          Slideshow
        </Button>
        <Button className="bg-sky-200 text-black hover:bg-sky-300 text-sm rounded-full ml-2" onClick={onShare}>
          Share
        </Button>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gr_dither-3QqXe6DPfhJhgKSCRKb04FhZTOJLyc.png"
          alt="Profile Picture"
          width={32}
          height={32}
          className="rounded-full"
        />
      </div>

      <TemplateGallery open={showTemplates} onOpenChange={setShowTemplates} onTemplateSelect={onTemplateSelect} />
    </div>
  )
}
