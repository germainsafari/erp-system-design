"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

export default function AccountingPage() {
  const t = useTranslations('accounting')
  const tCommon = useTranslations('common')
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch("/api/transactions")
        const result = await response.json()
        if (result.success) {
          setTransactions(result.data)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
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
    <AppLayout title={t('title')} description={t('description')}>
      <Card>
        <CardHeader>
          <CardTitle>{t('transactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">{t('transactionDate')}</th>
                  <th className="text-left p-4 font-medium">{t('amount')}</th>
                  <th className="text-left p-4 font-medium">{t('paymentMethod')}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">{new Date(transaction.transactionDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <span className="font-medium">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{transaction.paymentMethod}</Badge>
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




