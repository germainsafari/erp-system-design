"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { SalesOrder, OrderStatus, Customer, Product } from "@/lib/types"
import { Plus, Search, ShoppingCart, Clock, Truck, CheckCircle, X, Trash2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  CONFIRMED: "bg-primary/10 text-primary border-primary/20",
  SHIPPED: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  DELIVERED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
}

interface OrderItem {
  productId: string
  quantity: number
  unitPrice: number
}

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    customerId: "",
    notes: "",
    items: [] as OrderItem[],
  })
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    quantity: 1,
  })

  useEffect(() => {
    fetchOrders()
    fetchCustomers()
    fetchProducts()
  }, [])

  async function fetchOrders() {
    try {
      const response = await fetch("/api/sales/orders")
      const result = await response.json()
      if (result.success) {
        setOrders(result.data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
  }

  async function fetchCustomers() {
    try {
      const response = await fetch("/api/customers")
      const result = await response.json()
      if (result.success) {
        setCustomers(result.data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  async function fetchProducts() {
    try {
      const response = await fetch("/api/products")
      const result = await response.json()
      if (result.success) {
        setProducts(result.data.filter((p: Product) => p.active))
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  function addItemToOrder() {
    const product = products.find((p) => p.id === currentItem.productId)
    if (!product) {
      toast.error("Please select a product")
      return
    }

    if (currentItem.quantity <= 0) {
      toast.error("Quantity must be greater than 0")
      return
    }

    const existingItemIndex = formData.items.findIndex((item) => item.productId === currentItem.productId)
    if (existingItemIndex >= 0) {
      toast.error("Product already added. Remove it first to change quantity.")
      return
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: currentItem.productId,
          quantity: currentItem.quantity,
          unitPrice: product.price,
        },
      ],
    })
    setCurrentItem({ productId: "", quantity: 1 })
  }

  function removeItem(index: number) {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (formData.items.length === 0) {
      toast.error("Please add at least one item to the order")
      return
    }

    try {
      const response = await fetch("/api/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          items: formData.items,
          notes: formData.notes || undefined,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Order created successfully")
        setIsDialogOpen(false)
        setFormData({ customerId: "", notes: "", items: [] })
        setCurrentItem({ productId: "", quantity: 1 })
        fetchOrders()
      } else {
        toast.error(result.error || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Failed to create order")
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = status === "all" || order.status === status
    return matchesSearch && matchesStatus
  })

  const columns = [
    {
      key: "orderNumber",
      header: "Order #",
      render: (order: SalesOrder) => <span className="font-mono text-sm font-medium">{order.orderNumber}</span>,
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: SalesOrder) => (
        <div>
          <p className="font-medium">{order.customer?.name}</p>
          <p className="text-xs text-muted-foreground">{order.customer?.email}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (order: SalesOrder) => <span className="text-sm">{formatDate(order.orderDate)}</span>,
    },
    {
      key: "total",
      header: "Total",
      render: (order: SalesOrder) => <span className="font-medium">{formatCurrency(order.total)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (order: SalesOrder) => (
        <Badge variant="outline" className={statusColors[order.status]}>
          {order.status.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (order: SalesOrder) => (
        <Link href={`/sales/${order.id}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      ),
      className: "text-right",
    },
  ]

  const pendingCount = orders.filter((o) => o.status === "PENDING").length
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length

  const orderTotal = formData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  if (loading) {
    return (
      <AppLayout title="Sales Orders" description="Manage and track your sales orders">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Sales Orders" description="Manage and track your sales orders">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sales Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Order Items *</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex gap-2">
                    <Select value={currentItem.productId} onValueChange={(value) => setCurrentItem({ ...currentItem, productId: value })}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatCurrency(product.price)} (Stock: {product.currentStock || 0})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      className="w-24"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                    />
                    <Button type="button" onClick={addItemToOrder} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {formData.items.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      {formData.items.map((item, index) => {
                        const product = products.find((p) => p.id === item.productId)
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                            <div className="flex-1">
                              <p className="font-medium">{product?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(item.quantity * item.unitPrice)}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )
                      })}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="text-lg font-bold">{formatCurrency(orderTotal)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Optional notes for this order"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formData.items.length === 0 || !formData.customerId}>
                  Create Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{confirmedCount}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-5/10">
              <Truck className="w-4 h-4 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{shippedCount}</p>
              <p className="text-xs text-muted-foreground">Shipped</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{deliveredCount}</p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredOrders} columns={columns} keyField="id" total={filteredOrders.length} />
    </AppLayout>
  )
}
