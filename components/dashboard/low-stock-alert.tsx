"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { Product } from "@/lib/types"

export function LowStockAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLowStockProducts() {
      try {
        const response = await fetch("/api/products")
        const result = await response.json()
        if (result.success) {
          const products = result.data as Product[]
          const lowStock = products.filter((p) => (p.currentStock || 0) < p.minStock)
          setLowStockProducts(lowStock)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchLowStockProducts()
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (lowStockProducts.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Stock Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">All stock levels are healthy</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Stock Alerts</CardTitle>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {lowStockProducts.length} items
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {lowStockProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center justify-between px-6 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-destructive">{product.currentStock} left</p>
                <p className="text-xs text-muted-foreground">Min: {product.minStock}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
