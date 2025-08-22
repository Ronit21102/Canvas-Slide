"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { templates, type Template } from "@/data/templates"
import { Briefcase, GraduationCap, Palette, Megaphone, User } from "lucide-react"

interface TemplateGalleryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTemplateSelect: (template: Template) => void
}

export function TemplateGallery({ open, onOpenChange, onTemplateSelect }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { id: "all", label: "All Templates", icon: null },
    { id: "business", label: "Business", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "creative", label: "Creative", icon: Palette },
    { id: "marketing", label: "Marketing", icon: Megaphone },
    { id: "personal", label: "Personal", icon: User },
  ]

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((template) => template.category === selectedCategory)

  const getCategoryColor = (category: string) => {
    const colors = {
      business: "bg-blue-100 text-blue-800",
      education: "bg-green-100 text-green-800",
      creative: "bg-purple-100 text-purple-800",
      marketing: "bg-pink-100 text-pink-800",
      personal: "bg-yellow-100 text-yellow-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a professionally designed template and customize it to your needs.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="hidden sm:inline">{category.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      onTemplateSelect(template)
                      onOpenChange(false)
                    }}
                  >
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <img
                        src={template.thumbnail || "/placeholder.svg?height=200&width=300"}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                          {template.name}
                        </h3>
                        <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {template.slides.length} slide{template.slides.length !== 1 ? "s" : ""}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-transparent"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No templates found in this category.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
