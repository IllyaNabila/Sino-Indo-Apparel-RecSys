"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Trash2, Eye, Package } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import axios from "axios"

interface ProductData {
  id: string
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
  images: File[] // Can be File objects or URLs
}

type ProductUI = {
  id: string,
  name: string;
  category: string;
  material: string;
  moq: string;
  price: string;      // combined priceMin/priceMax
  images: string[];
};


export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: "Organic Cotton T-Shirts",
      category: "T-Shirts",
      material: "100% Organic Cotton",
      moq: "500 pcs",
      price: "$8-12",
      images: ["https://th.bing.com/th/id/OIP.Js94Ngprk3Ij_nkbudAk6gAAAA?cb=thvnextc1&rs=1&pid=ImgDetMain?height=200&width=200"],
      status: "active",
      views: 245,
      inquiries: 12,
    },
    {
      id: 2,
      name: "Denim Jeans - Slim Fit",
      category: "Jeans",
      material: "Cotton Denim",
      moq: "200 pcs",
      price: "$15-25",
      images: ["https://th.bing.com/th/id/OIP.jlzA-JE31Okb842Ah6tmLwHaLH?cb=thvnextc1&rs=1&pid=ImgDetMain?height=200&width=200"],
      status: "active",
      views: 189,
      inquiries: 8,
    },
    {
      id: 3,
      name: "Summer Dresses",
      category: "Dresses",
      material: "Cotton Blend",
      moq: "300 pcs",
      price: "$12-18",
      images: ["https://kellyinthecity.s3.amazonaws.com/wp-content/uploads/2023/07/Summer-Dresses-Under-100_6.png?height=200&width=200"],
      status: "draft",
      views: 67,
      inquiries: 3,
    },
    {
      id: 4,
      name: "Hooded Sweatshirts",
      category: "Hoodies",
      material: "Cotton Polyester",
      moq: "250 pcs",
      price: "$18-28",
      images: ["https://images.stockx.com/images/Supreme-S-Logo-Hooded-Sweatshirt-FW20-Navy.jpg?fit=fill&bg=FFFFFF&w=700&h=500&auto=format,compress&q=90&dpr=2&trim=color&updated_at=1611195675?height=200&width=200"],
      status: "active",
      views: 312,
      inquiries: 15,
    },
  ]

  
  const toProductUI = (p: any): ProductUI => ({
    id: p._id ?? "",
    name: p.name ?? "",
    category: p.category ?? "",
    material: p.material ?? "",
    moq: p.moq ?? "",
    price: p.priceMin && p.priceMax ? `${p.priceMin}-${p.priceMax}` : p.priceMin || p.priceMax || "",
    images: p.images ?? [],
  });
  
  const [productDetails, setProductDetails] = useState<any[]>([]);

  const initialProductState: ProductData = {
    id: "",
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
  };
  
  const filteredProducts = productDetails.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.material.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  
  const [displayProduct, setDisplayProduct] = useState(false);
  const [displayProductDetails, setDisplayProductDetails] = useState<ProductData>(initialProductState);

  const resetProductDetails = () => {
    setDisplayProductDetails(initialProductState);
  };

  const handleDisplayProduct = async (productId: string) =>{
    setDisplayProduct(true);
    resetProductDetails();
    try {
      const {data} = await axios.get(`/api/products?id=${productId}`);
      const mockProduct = {
          id: productId,
          name: data.name,
          category: data.category,
          material: data.material,
          moq: data.moq,
          priceMin: data.priceMin,
          priceMax: data.priceMax,
          description: data.description,
          colors: data.colors,
          sizes: data.sizes,
          leadTime: data.leadTime,
          images: data.images,
        }
      setDisplayProductDetails(mockProduct); 
    } catch (error: any) {
      console.error("Error loading product:", error)
    }
  }

  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  // Add delete handler
  const handleDeleteProduct = (productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (productToDelete) {
      // Remove product from list
      console.log("Deleting product:", productToDelete)
      try {
        const res = await axios.delete(`/api/products?id=${productToDelete}`);

        if (res.status === 200) {

          setDeleteDialogOpen(false)
          setProductToDelete(null)
          
          console.log("Product deleted:", res.data);
          fetchProducts();
        } else {
          console.error("Failed to delete product:", res.data)
        }
      } catch (err: any) {
        console.error("Error deleting product:", err);
      }
    }
  }

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/products");
      const mapped = data.map(toProductUI);
      console.log("data", data);
      setProductDetails(mapped);
      setLoading(false);
    } catch (err: any) {  
      console.error("Error fetching product:", err.response?.data?.error || err.message);
      setLoading(false);
    }
  };

  useEffect(() =>{
    fetchProducts();
  }, []);
  
  console.log("fetchproducts", productDetails);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Product Catalog</h1>
            <p className="text-slate-600">Manage your product listings and showcase your offerings</p>
          </div>
          <Link href="/products/new">
            <Button className="bg-rose-500 hover:bg-rose-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards 
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Products</p>
                  <p className="text-2xl font-bold text-slate-800">{products.length}</p>
                </div>
                <Package className="h-8 w-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Views</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {products.reduce((sum, product) => sum + product.views, 0)}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Inquiries</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {products.reduce((sum, product) => sum + product.inquiries, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Active Products</p>
                  <p className="text-2xl font-bold text-slate-800">
                    {products.filter((p) => p.status === "active").length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>*/}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search products by name, category, or material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productDetails.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={`data:image/png;base64,${product.images[0]}` || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {/* Products Grid 
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                      className={product.status === "active" ? "bg-emerald-600" : ""}
                    >
                      {product.status}
                    </Badge>
                  </div>*/}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-800 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-slate-600">{product.category}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Material:</span>
                      <span className="font-medium">{product.material}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">MOQ:</span>
                      <span className="font-medium">{product.moq}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Price:</span>
                      <span className="font-medium text-slate-500">{product.price}</span>
                    </div>
                  </div>
{/** 
                  <div className="flex justify-between text-xs text-slate-500 pt-2 border-t">
                    <span>{product.views} views</span>
                    <span>{product.inquiries} inquiries</span>
                  </div>*/}

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDisplayProduct(product.id)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Link href={`/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No products found</h3>
            <p className="text-slate-600 mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Start by adding your first product"}
            </p>
            <Link href="/products/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        )}
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={displayProduct} onOpenChange={setDisplayProduct}>
        <DialogContent className="overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
        {displayProductDetails.name || "Unnamed Product"}
            </DialogTitle>
            <DialogDescription>
              View detailed product information below.
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="space-y-4 mt-2 overflow-y-auto max-h-[60vh]">
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-base">{displayProductDetails.description || "-"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{displayProductDetails.category || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Material</p>
                <p className="font-medium">{displayProductDetails.material || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MOQ</p>
                <p className="font-medium">{displayProductDetails.moq || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lead Time</p>
                <p className="font-medium">{displayProductDetails.leadTime || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price Min</p>
                <p className="font-medium">RM {displayProductDetails.priceMin || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price Max</p>
                <p className="font-medium">RM {displayProductDetails.priceMax || "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Colors</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {displayProductDetails.colors?.length > 0 ? (
                  displayProductDetails.colors.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-sm rounded bg-gray-100"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No colors specified</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Sizes</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {displayProductDetails.sizes?.length > 0 ? (
                  displayProductDetails.sizes.map((s, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-sm rounded bg-gray-100"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No sizes specified</p>
                )}
              </div>
            </div>

            {/* Images */}
            {displayProductDetails.images?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Images</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {displayProductDetails.images.map((img, i) => (
                    <img
                      key={i}
                      src={typeof img === "string" ? `data:image/png;base64,${img}` : URL.createObjectURL(img)}
                      alt={`Product image ${i + 1}`}
                      className="rounded-lg border object-cover h-32 w-full"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
