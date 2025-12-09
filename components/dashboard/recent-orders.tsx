"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { OrderStatus, SalesOrder } from "@/lib/types"

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  CONFIRMED: "bg-primary/10 text-primary border-primary/20",
  SHIPPED: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  DELIVERED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecentOrders() {
  const [recentOrders, setRecentOrders] = useState<SalesOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        const response = await fetch("/api/sales/orders")
        const result = await response.json()
        if (result.success) {
          const orders = (result.data as SalesOrder[]).slice(0, 5)
          setRecentOrders(orders)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecentOrders()
  }, [])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-6 py-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {order.customer?.name} • {formatDate(order.orderDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={statusColors[order.status]}>
                  {order.status.toLowerCase()}
                </Badge>
                <span className="text-sm font-medium w-20 text-right">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
