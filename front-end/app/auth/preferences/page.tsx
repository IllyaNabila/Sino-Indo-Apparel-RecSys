"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, Plus, X } from "lucide-react"

// Mock data for preferences
const PRODUCT_TYPES = [
  { id: "tshirts", label: "T-shirts" },
  { id: "jeans", label: "Jeans" },
  { id: "dresses", label: "Dresses" },
  { id: "activewear", label: "Activewear" },
  { id: "outerwear", label: "Outerwear" },
  { id: "underwear", label: "Underwear" },
  { id: "socks", label: "Socks" },
  { id: "accessories", label: "Accessories" },
  { id: "childrenswear", label: "Children's Wear" },
  { id: "formalwear", label: "Formal Wear" },
]

const MATERIALS = [
  { id: "cotton", label: "Cotton" },
  { id: "polyester", label: "Polyester" },
  { id: "wool", label: "Wool" },
  { id: "silk", label: "Silk" },
  { id: "linen", label: "Linen" },
  { id: "denim", label: "Denim" },
  { id: "leather", label: "Leather" },
  { id: "synthetic", label: "Synthetic Blends" },
  { id: "recycled", label: "Recycled Materials" },
  { id: "organic", label: "Organic Materials" },
]

const REGIONS = [
  { id: "northChina", label: "North China" },
  { id: "eastChina", label: "East China" },
  { id: "southChina", label: "South China" },
  { id: "westChina", label: "West China" },
  { id: "centralChina", label: "Central China" },
  { id: "jakarta", label: "Jakarta, Indonesia" },
  { id: "westJava", label: "West Java, Indonesia" },
  { id: "eastJava", label: "East Java, Indonesia" },
  { id: "bali", label: "Bali, Indonesia" },
  { id: "sumatra", label: "Sumatra, Indonesia" },
]

export default function PreferencesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "importer"

  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")

  const handleProductTypeChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProductTypes([...selectedProductTypes, id])
    } else {
      setSelectedProductTypes(selectedProductTypes.filter((item) => item !== id))
    }
  }

  const handleMaterialChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials([...selectedMaterials, id])
    } else {
      setSelectedMaterials(selectedMaterials.filter((item) => item !== id))
    }
  }

  const handleRegionChange = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions([...selectedRegions, id])
    } else {
      setSelectedRegions(selectedRegions.filter((item) => item !== id))
    }
  }

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save the preferences here
    router.push("/dashboard")
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/auth/license-upload?role=${role}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to license upload</span>
          </Link>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <span className="text-primary">Apparel</span>Connect
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-center">Set Your Preferences</h1>
          <p className="text-center text-muted-foreground mt-2">
            Help us understand your needs to provide better recommendations
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Preferences</CardTitle>
            <CardDescription>
              Select your preferences to help us match you with the right partners. You can update these anytime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Product Types</h3>
                <p className="text-sm text-muted-foreground">
                  Select the types of apparel products you are interested in
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PRODUCT_TYPES.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`product-${type.id}`}
                        checked={selectedProductTypes.includes(type.id)}
                        onCheckedChange={(checked) => handleProductTypeChange(type.id, checked as boolean)}
                      />
                      <Label htmlFor={`product-${type.id}`} className="text-sm">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Materials</h3>
                <p className="text-sm text-muted-foreground">Select the materials you work with or are interested in</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MATERIALS.map((material) => (
                    <div key={material.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`material-${material.id}`}
                        checked={selectedMaterials.includes(material.id)}
                        onCheckedChange={(checked) => handleMaterialChange(material.id, checked as boolean)}
                      />
                      <Label htmlFor={`material-${material.id}`} className="text-sm">
                        {material.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Regions</h3>
                <p className="text-sm text-muted-foreground">
                  Select the regions you are interested in doing business with
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {REGIONS.map((region) => (
                    <div key={region.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region.id}`}
                        checked={selectedRegions.includes(region.id)}
                        onCheckedChange={(checked) => handleRegionChange(region.id, checked as boolean)}
                      />
                      <Label htmlFor={`region-${region.id}`} className="text-sm">
                        {region.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Custom Tags</h3>
                <p className="text-sm text-muted-foreground">
                  Add any additional preferences or requirements not covered above
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {customTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeCustomTag(tag)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag}</span>
                      </Button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a custom tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addCustomTag} disabled={!newTag.trim()}>
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">Complete Registration</Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            <p>
              Your preferences help us provide better recommendations. You can update these preferences anytime from
              your profile settings.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
