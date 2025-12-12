"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { createSalesOrderSchema, type CreateSalesOrderInput } from "@/lib/validators"
import { toast } from "sonner"

export default function SalesPage() {
  const t = useTranslations('sales')
  const tCommon = useTranslations('common')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  const form = useForm<CreateSalesOrderInput>({
    resolver: zodResolver(createSalesOrderSchema),
    defaultValues: {
      customerId: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          fetch("/api/sales/orders"),
          fetch("/api/customers"),
          fetch("/api/products"),
        ])

        const ordersResult = await ordersRes.json()
        const customersResult = await customersRes.json()
        const productsResult = await productsRes.json()

        if (ordersResult.success) {
          setOrders(ordersResult.data)
        }
        if (customersResult.success) {
          setCustomers(customersResult.data)
        }
        if (productsResult.success) {
          setProducts(productsResult.data)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const onSubmit = async (data: CreateSalesOrderInput) => {
    try {
      const response = await fetch("/api/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('orderCreated') || "Order created successfully")
        setDialogOpen(false)
        form.reset()
        form.setValue("items", [{ productId: "", quantity: 1, unitPrice: 0 }])
        
        // Refresh orders list
        const refreshResponse = await fetch("/api/sales/orders")
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setOrders(refreshResult.data)
        }
      } else {
        toast.error(result.error || tCommon('somethingWentWrong') || "Something went wrong")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error(tCommon('somethingWentWrong') || "Something went wrong")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: t('pending') },
      processing: { variant: "default", label: t('processing') },
      completed: { variant: "success", label: t('completed') },
      cancelled: { variant: "destructive", label: t('cancelled') },
    }
    const statusInfo = statusMap[status] || statusMap.pending
    return <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
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
          {t('newOrder')}
        </Button>
      }
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('newOrder')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('customer')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectCustomer') || "Select a customer"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>{t('items') || 'Items'}</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addItem') || 'Add Item'}
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const selectedProduct = products.find(
                    (p) => p.id === form.watch(`items.${index}.productId`)
                  )

                  return (
                    <Card key={field.id} className="p-4">
                      <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-5">
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('product') || 'Product'}</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    const product = products.find((p) => p.id === value)
                                    if (product) {
                                      form.setValue(`items.${index}.unitPrice`, Number(product.price))
                                    }
                                  }}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t('selectProduct') || "Select product"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name} - {formatCurrency(product.price)}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('quantity') || 'Qty'}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-3">
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t('unitPrice') || 'Unit Price'}</FormLabel>
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
                        </div>
                        <div className="col-span-1">
                          <FormLabel className="opacity-0">Remove</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="col-span-1 text-right">
                          <FormLabel className="opacity-0">Total</FormLabel>
                          <p className="text-sm font-medium">
                            {formatCurrency(
                              (form.watch(`items.${index}.quantity`) || 0) *
                                (form.watch(`items.${index}.unitPrice`) || 0)
                            )}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{t('total') || 'Total'}</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(
                      form
                        .watch("items")
                        .reduce(
                          (sum, item) =>
                            sum + (item.quantity || 0) * (item.unitPrice || 0),
                          0
                        )
                    )}
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('notes') || 'Notes'}</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">{t('orderNumber')}</th>
                  <th className="text-left p-4 font-medium">{t('customer')}</th>
                  <th className="text-left p-4 font-medium">{t('date')}</th>
                  <th className="text-left p-4 font-medium">{t('status')}</th>
                  <th className="text-left p-4 font-medium">{t('total')}</th>
                  <th className="text-left p-4 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">#{order.id}</td>
                    <td className="p-4">{order.customer?.name || 'N/A'}</td>
                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">{getStatusBadge(order.status)}</td>
                    <td className="p-4">{formatCurrency(order.totalAmount)}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        {t('viewDetails')}
                      </Button>
                    </td>
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




