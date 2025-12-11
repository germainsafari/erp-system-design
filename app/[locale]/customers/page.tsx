"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { CustomerHealthDashboard } from "@/components/customers/customer-health-dashboard"
import { formatCurrency } from "@/lib/utils"

export default function CustomersPage() {
  const t = useTranslations('customers')
  const tCommon = useTranslations('common')
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch("/api/customers")
        const result = await response.json()
        if (result.success) {
          setCustomers(result.data)
        }
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomers()
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
          {t('addCustomer')}
        </Button>
      }
    >
      <div className="mb-6">
        <CustomerHealthDashboard />
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
                  <th className="text-left p-4 font-medium">{t('customerName')}</th>
                  <th className="text-left p-4 font-medium">{t('email')}</th>
                  <th className="text-left p-4 font-medium">{t('phone')}</th>
                  <th className="text-left p-4 font-medium">{t('totalOrders')}</th>
                  <th className="text-left p-4 font-medium">{t('totalSpent')}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{customer.name}</td>
                    <td className="p-4">{customer.email}</td>
                    <td className="p-4">{customer.phone || 'N/A'}</td>
                    <td className="p-4">{customer._count?.orders || 0}</td>
                    <td className="p-4">{formatCurrency(customer.totalSpent || 0)}</td>
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



