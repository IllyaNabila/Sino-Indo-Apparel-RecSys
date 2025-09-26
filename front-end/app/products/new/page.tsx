"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, X, Plus, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import axios from "axios"

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
  images: File[]
}

export default function NewProductPage() {
  const router = useRouter()
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

    {/**/}
    if (formData.images.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
{/** */}

  const convertToBase64 = (file: File): Promise<string> =>{
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1];
        if (base64String) resolve(base64String);
        else reject("Conversion failed");
      };

      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setFormData({ ...formData, images: [...formData.images, ...files] })
      // Clear image error if images are added
      if (errors.images) {
        setErrors({ ...errors, images: "" })
      }
    }
  };

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
      // Convert all images to base64
      const base64Images = await Promise.all(
        formData.images.map((file) => convertToBase64(file))
      );

      // Simulate API call
      const response = await axios.post('/api/products', {...formData, images: base64Images,});
      const productData = {
        ...formData,
        images: base64Images,
        price: `$${formData.priceMin}-${formData.priceMax}`,
        moq: `${formData.moq} pcs`,
        id: Date.now(), // Generate temporary ID
        status: "active",
        views: 0,
        inquiries: 0,
      }

      console.log("Creating product:", productData)
      console.log("Saved:", response.data);
      // Redirect to products page
      router.push("/products")
    } catch (error) {
      console.error("Error creating product:", error)
    } finally {
      setIsSubmitting(false)
    }
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
              <h1 className="text-2xl font-bold text-slate-800">Add New Product</h1>
              <p className="text-slate-600">Create a new product listing for your catalog</p>
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
              <CardDescription>Enter the essential details about your product</CardDescription>
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

          {/**  Pricing and MOQ**/}
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Order Details</CardTitle>
              <CardDescription>Set your pricing and minimum order requirements</CardDescription>
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

          {/** Product Images **/}
          <Card>
            <CardHeader>
              <CardTitle>
                Product Images <span className="text-red-500">*</span>
              </CardTitle>
              <CardDescription>Upload high-quality images of your product (at least 1 required)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <Label htmlFor="images" className="cursor-pointer">
                    <Button type="button" variant="outline">
                      Choose Images
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
{/***/}
              {errors.images && (
                <p className="text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.images}
                </p>
              )} 

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
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
            </CardContent>
          </Card>

          {/* Colors and Sizes */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Add available colors and sizes for your product</CardDescription>
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
                    onChange={(e) => {
                      const value = e.target.value;
                      const capitalized = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
                      setNewColor(capitalized);
                    }}
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
                    onChange={(e) => setNewSize(e.target.value.toUpperCase())}
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
                  Creating Product...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
