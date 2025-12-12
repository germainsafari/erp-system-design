"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { CustomerHealthDashboard } from "@/components/customers/customer-health-dashboard"
import { formatCurrency } from "@/lib/utils"
import { createCustomerSchema, type CreateCustomerInput } from "@/lib/validators"
import { toast } from "sonner"

export default function CustomersPage() {
  const t = useTranslations('customers')
  const tCommon = useTranslations('common')
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

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

  const onSubmit = async (data: CreateCustomerInput) => {
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('customerAdded') || "Customer added successfully")
        setDialogOpen(false)
        form.reset()
        
        // Refresh customers list
        const refreshResponse = await fetch("/api/customers")
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setCustomers(refreshResult.data)
        }
      } else {
        toast.error(result.error || tCommon('somethingWentWrong') || "Something went wrong")
      }
    } catch (error) {
      console.error("Error creating customer:", error)
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
          {t('addCustomer')}
        </Button>
      }
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addCustomer')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('customerName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('address') || 'Address'}</FormLabel>
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




