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
import { createSupplierSchema, type CreateSupplierInput } from "@/lib/validators"
import { toast } from "sonner"

export default function SuppliersPage() {
  const t = useTranslations('suppliers')
  const tCommon = useTranslations('common')
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<CreateSupplierInput>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name: "",
      contactName: "",
      email: "",
      phone: "",
      address: "",
      active: true,
    },
  })

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

  const onSubmit = async (data: CreateSupplierInput) => {
    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('supplierAdded') || "Supplier added successfully")
        setDialogOpen(false)
        form.reset()
        
        // Refresh suppliers list
        const refreshResponse = await fetch("/api/suppliers")
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setSuppliers(refreshResult.data)
        }
      } else {
        toast.error(result.error || tCommon('somethingWentWrong') || "Something went wrong")
      }
    } catch (error) {
      console.error("Error creating supplier:", error)
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
          {t('addSupplier')}
        </Button>
      }
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addSupplier')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('supplierName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contactPerson')}</FormLabel>
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




