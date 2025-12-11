"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function HRPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch("/api/employees")
        const result = await response.json()
        if (result.success) {
          setEmployees(result.data)
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEmployees()
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
          {t('addEmployee')}
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('employees')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">{t('employeeName')}</th>
                  <th className="text-left p-4 font-medium">{t('position')}</th>
                  <th className="text-left p-4 font-medium">{t('department')}</th>
                  <th className="text-left p-4 font-medium">{t('salary')}</th>
                  <th className="text-left p-4 font-medium">{t('hireDate')}</th>
                  <th className="text-left p-4 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-medium">{employee.name}</td>
                    <td className="p-4">{employee.position}</td>
                    <td className="p-4">{employee.department || 'N/A'}</td>
                    <td className="p-4">{formatCurrency(employee.salary)}</td>
                    <td className="p-4">{new Date(employee.hireDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      <Badge variant={employee.status === 'active' ? 'success' : 'secondary'}>
                        {employee.status === 'active' ? t('active') : t('inactive')}
                      </Badge>
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



