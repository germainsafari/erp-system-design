"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function SalesPage() {
  const t = useTranslations('sales')
  const tCommon = useTranslations('common')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/sales/orders")
        const result = await response.json()
        if (result.success) {
          setOrders(result.data)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {t('newOrder')}
        </Button>
      }
    >
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




