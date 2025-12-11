"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle } from "lucide-react"
import { ReorderSuggestions } from "@/components/inventory/reorder-suggestions"
import { formatCurrency } from "@/lib/utils"

export default function InventoryPage() {
  const t = useTranslations('inventory')
  const tCommon = useTranslations('common')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products")
        const result = await response.json()
        if (result.success) {
          setProducts(result.data)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  if (loading) {
    return (
      <AppLayout title={t('title')} description={t('description')}>
        <div className="flex items-center justify-center h-64">
          <p>{tCommon('loading')}</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      title={t('title')} 
      description={t('description')}
      action={
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('addProduct')}
        </Button>
      }
    >
      <div className="mb-6">
        <ReorderSuggestions />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">{t('productName')}</th>
                  <th className="text-left p-4 font-medium">{t('sku')}</th>
                  <th className="text-left p-4 font-medium">{t('category')}</th>
                  <th className="text-left p-4 font-medium">{t('stockLevel')}</th>
                  <th className="text-left p-4 font-medium">{t('price')}</th>
                  <th className="text-left p-4 font-medium">{t('supplier')}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">{product.sku}</td>
                    <td className="p-4">{product.category || 'N/A'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {product.stockQuantity <= product.reorderPoint && (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                        <span className={product.stockQuantity <= product.reorderPoint ? "text-warning font-medium" : ""}>
                          {product.stockQuantity}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">{formatCurrency(product.price)}</td>
                    <td className="p-4">{product.supplier?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  )
}



