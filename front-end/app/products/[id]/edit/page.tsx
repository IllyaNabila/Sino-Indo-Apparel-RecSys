"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, X, Plus, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

interface ProductFormData {
  name: string
  category: string
  material: string
  moq: string
  priceMin: string
  priceMax: string
  description: string
  colors: string[]
  sizes: string[]
  leadTime: string
  images: (File | string)[] // Can be File objects or URLs
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category: "",
    material: "",
    moq: "",
    priceMin: "",
    priceMax: "",
    description: "",
    colors: [],
    sizes: [],
    leadTime: "",
    images: [],
  })

  const [newColor, setNewColor] = useState("")
  const [newSize, setNewSize] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const categories = [
    "T-Shirts",
    "Jeans",
    "Dresses",
    "Hoodies",
    "Jackets",
    "Shirts",
    "Pants",
    "Skirts",
    "Activewear",
    "Underwear",
    "Accessories",
    "Children's Wear",
  ]

  const materials = [
    "Cotton",
    "Organic Cotton",
    "Polyester",
    "Recycled Polyester",
    "Wool",
    "Silk",
    "Linen",
    "Bamboo",
    "Hemp",
    "Denim",
    "Spandex",
    "Modal",
    "Tencel",
    "Nylon",
    "Rayon",
  ]

  // Load existing product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Simulate API call to load product data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock product data - in real app, this would come from API
        const mockProduct = {
          id: productId,
          name: "Organic Cotton T-Shirts",
          category: "T-Shirts",
          material: "Organic Cotton",
          moq: "500",
          priceMin: "8",
          priceMax: "15",
          description: "Premium organic cotton t-shirts with GOTS certification. Soft, comfortable, and sustainable.",
          colors: ["White", "Black", "Navy", "Gray"],
          sizes: ["S", "M", "L", "XL", "XXL"],
          leadTime: "2-3 weeks",
          images: [
            "/placeholder.svg?height=200&width=200",
            "/placeholder.svg?height=200&width=200",
            "/placeholder.svg?height=200&width=200",
          ],
        }

        setFormData(mockProduct)
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Mandatory field validation
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (!formData.material) {
      newErrors.material = "Material is required"
    }

    if (!formData.moq.trim()) {
      newErrors.moq = "MOQ is required"
    } else if (isNaN(Number(formData.moq)) || Number(formData.moq) <= 0) {
      newErrors.moq = "MOQ must be a positive number"
    }

    if (!formData.priceMin.trim()) {
      newErrors.priceMin = "Minimum price is required"
    } else if (isNaN(Number(formData.priceMin)) || Number(formData.priceMin) <= 0) {
      newErrors.priceMin = "Price must be a positive number"
    }

    if (!formData.priceMax.trim()) {
      newErrors.priceMax = "Maximum price is required"
    } else if (isNaN(Number(formData.priceMax)) || Number(formData.priceMax) <= 0) {
      newErrors.priceMax = "Price must be a positive number"
    }

    if (formData.priceMin.trim() && formData.priceMax.trim() && Number(formData.priceMin) > Number(formData.priceMax)) {
      newErrors.priceMax = "Maximum price must be greater than minimum price"
    }

    if (formData.images.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData({ ...formData, images: [...formData.images, ...files] })
      // Clear image error if images are added
      if (errors.images) {
        setErrors({ ...errors, images: "" })
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData({ ...formData, colors: [...formData.colors, newColor.trim()] })
      setNewColor("")
    }
  }

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter((c) => c !== color) })
  }

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize.trim()] })
      setNewSize("")
    }
  }

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const productData = {
        ...formData,
        price: `$${formData.priceMin}-${formData.priceMax}`,
        moq: `${formData.moq} pcs`,
        id: productId,
      }

      console.log("Updating product:", productData)

      // Redirect to products page
      router.push("/products")
    } catch (error) {
      console.error("Error updating product:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading product...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Edit Product</h1>
              <p className="text-slate-600">Update your product information</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the essential details about your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Organic Cotton T-Shirt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="material">
                  Material <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.material}
                  onValueChange={(value) => setFormData({ ...formData, material: value })}
                >
                  <SelectTrigger className={errors.material ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material} value={material}>
                        {material}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.material && (
                  <p className="text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.material}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Product Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product features, quality, and specifications..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing and MOQ */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Order Details</CardTitle>
              <CardDescription>Update your pricing and minimum order requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="priceMin">
                    Minimum Price (USD) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="priceMin"
                    type="number"
                    step="0.01"
                    placeholder="8.00"
                    value={formData.priceMin}
                    onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                    className={errors.priceMin ? "border-red-500" : ""}
                  />
                  {errors.priceMin && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.priceMin}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priceMax">
                    Maximum Price (USD) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="priceMax"
                    type="number"
                    step="0.01"
                    placeholder="15.00"
                    value={formData.priceMax}
                    onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                    className={errors.priceMax ? "border-red-500" : ""}
                  />
                  {errors.priceMax && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.priceMax}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="moq">
                    MOQ (pieces) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="moq"
                    type="number"
                    placeholder="500"
                    value={formData.moq}
                    onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                    className={errors.moq ? "border-red-500" : ""}
                  />
                  {errors.moq && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.moq}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTime">Lead Time</Label>
                <Input
                  id="leadTime"
                  placeholder="e.g., 2-3 weeks"
                  value={formData.leadTime}
                  onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>
                Product Images <span className="text-red-500">*</span>
              </CardTitle>
              <CardDescription>Update your product images (at least 1 required)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={typeof image === "string" ? image : URL.createObjectURL(image)}
                        alt={`Product ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Image Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="images" className="cursor-pointer">
                    <Button type="button" variant="outline">
                      Add More Images
                    </Button>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-sm text-slate-500">PNG, JPG up to 5MB each. Multiple images allowed.</p>
                </div>
              </div>

              {errors.images && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.images}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Colors and Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Update available colors and sizes for your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Colors */}
              <div className="space-y-4">
                <Label>Available Colors</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <Badge key={color} variant="secondary" className="flex items-center">
                      {color}
                      <button type="button" onClick={() => removeColor(color)} className="ml-2">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" onClick={addColor} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-4">
                <Label>Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size) => (
                    <Badge key={size} variant="secondary" className="flex items-center">
                      {size}
                      <button type="button" onClick={() => removeSize(size)} className="ml-2">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add size (e.g., S, M, L, XL)"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" onClick={addSize} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating Product...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
