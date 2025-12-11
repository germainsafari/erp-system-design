"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function SuppliersPage() {
  const t = useTranslations('suppliers')
  const tCommon = useTranslations('common')
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const response = await fetch("/api/suppliers")
        const result = await response.json()
        if (result.success) {
          setSuppliers(result.data)
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchSuppliers()
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
          {t('addSupplier')}
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
                  <th className="text-left p-4 font-medium">{t('supplierName')}</th>
                  <th className="text-left p-4 font-medium">{t('contactPerson')}</th>
                  <th className="text-left p-4 font-medium">{t('email')}</th>
                  <th className="text-left p-4 font-medium">{t('phone')}</th>
                  <th className="text-left p-4 font-medium">{t('productsSupplied')}</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{supplier.name}</td>
                    <td className="p-4">{supplier.contactPerson || 'N/A'}</td>
                    <td className="p-4">{supplier.email}</td>
                    <td className="p-4">{supplier.phone || 'N/A'}</td>
                    <td className="p-4">{supplier._count?.products || 0}</td>
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



