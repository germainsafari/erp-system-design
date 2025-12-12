"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { createEmployeeSchema, type CreateEmployeeInput } from "@/lib/validators"
import { toast } from "sonner"

export default function HRPage() {
  const t = useTranslations('hr')
  const tCommon = useTranslations('common')
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      position: "",
      hireDate: new Date().toISOString().split('T')[0],
      salary: undefined,
      status: "ACTIVE",
    },
  })

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

  const onSubmit = async (data: CreateEmployeeInput) => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(t('employeeAdded') || "Employee added successfully")
        setDialogOpen(false)
        form.reset()
        
        // Refresh employees list
        const refreshResponse = await fetch("/api/employees")
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setEmployees(refreshResult.data)
        }
      } else {
        toast.error(result.error || tCommon('somethingWentWrong') || "Something went wrong")
      }
    } catch (error) {
      console.error("Error creating employee:", error)
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
          {t('addEmployee')}
        </Button>
      }
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('addEmployee')}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('firstName') || 'First Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lastName') || 'Last Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email') || 'Email'}</FormLabel>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('department')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('position')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="hireDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('hireDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('salary')}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('status')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">{t('active')}</SelectItem>
                          <SelectItem value="ON_LEAVE">{t('onLeave') || 'On Leave'}</SelectItem>
                          <SelectItem value="TERMINATED">{t('terminated') || 'Terminated'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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




