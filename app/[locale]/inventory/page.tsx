"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, AlertTriangle } from "lucide-react"
import { ReorderSuggestions } from "@/components/inventory/reorder-suggestions"
import { formatCurrency } from "@/lib/utils"
import { createProductSchema, type CreateProductInput } from "@/lib/validators"
import { toast } from "sonner"

export default function InventoryPage() {
  const t = useTranslations('inventory')
  const tCommon = useTranslations('common')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      sku: "",
      name: "",
      description: "",
      price: 0,
      cost: 0,
      category: "",
      minStock: 10,
      active: true,
    },
  })

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

  const onSubmit = async (data: CreateProductInput) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('productAdded') || "Product added successfully")
        setDialogOpen(false)
        form.reset()
        
        // Refresh products list
        const refreshResponse = await fetch("/api/products")
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setProducts(refreshResult.data)
        }
      } else {
        toast.error(result.error || tCommon('somethingWentWrong') || "Something went wrong")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error(tCommon('somethingWentWrong') || "Something went wrong")
    }
  }

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
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t('addProduct')}
        </Button>
      }
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('addProduct')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('sku')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('productName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('description') || 'Description'}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('price')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('cost') || 'Cost'}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('minStock') || 'Min Stock'}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {tCommon('cancel') || 'Cancel'}
                </Button>
                <Button type="submit">
                  {tCommon('save') || 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
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




