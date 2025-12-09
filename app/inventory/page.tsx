"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/lib/types"
import { Plus, Search, Package } from "lucide-react"
import { toast } from "sonner"
import { ReorderSuggestions } from "@/components/inventory/reorder-suggestions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    cost: "",
    category: "",
    minStock: "10",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products")
      const result = await response.json()
      if (result.success) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: formData.sku,
          name: formData.name,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          category: formData.category,
          minStock: parseInt(formData.minStock) || 10,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Product added successfully")
        setIsDialogOpen(false)
        setFormData({ sku: "", name: "", description: "", price: "", cost: "", category: "", minStock: "10" })
        fetchProducts()
      } else {
        toast.error(result.error || "Failed to add product")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error("Failed to add product")
    }
  }

  const categories = [...new Set(products.map((p) => p.category))]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === "all" || product.category === category
    return matchesSearch && matchesCategory
  })

  const columns = [
    {
      key: "sku",
      header: "SKU",
      render: (product: Product) => <span className="font-mono text-sm">{product.sku}</span>,
    },
    {
      key: "name",
      header: "Product Name",
      render: (product: Product) => (
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-xs text-muted-foreground">{product.category}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product: Product) => formatCurrency(product.price),
    },
    {
      key: "cost",
      header: "Cost",
      render: (product: Product) => formatCurrency(product.cost),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: Product) => {
        const isLow = (product.currentStock || 0) < product.minStock
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? "text-destructive font-medium" : ""}>{product.currentStock}</span>
            {isLow && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                Low
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (product: Product) => (
        <Badge
          variant="outline"
          className={product.active ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}
        >
          {product.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  if (loading) {
    return (
      <AppLayout title="Inventory" description="Manage your products and stock levels">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Inventory" description="Manage your products and stock levels">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    placeholder="ELEC-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Furniture">Furniture</SelectItem>
                      <SelectItem value="Supplies">Supplies</SelectItem>
                      {categories.filter((c) => !["Electronics", "Furniture", "Supplies"].includes(c)).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="10"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Product</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="reorder">
            <Package className="w-4 h-4 mr-2" />
            Smart Reordering
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{products.length}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Package className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{products.filter((p) => p.active).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Package className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {products.filter((p) => (p.currentStock || 0) < p.minStock).length}
              </p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-5/10">
              <Package className="w-4 h-4 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{categories.length}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredProducts} columns={columns} keyField="id" total={filteredProducts.length} />
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <ReorderSuggestions />
        </TabsContent>
      </Tabs>
    </AppLayout>
  )
}
