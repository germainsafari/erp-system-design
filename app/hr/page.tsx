"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, formatCurrency } from "@/lib/utils"
import type { Employee, EmployeeStatus } from "@/lib/types"
import { Plus, Search, Users, Building2, Briefcase } from "lucide-react"
import { toast } from "sonner"

const statusColors: Record<EmployeeStatus, string> = {
  ACTIVE: "bg-success/10 text-success border-success/20",
  ON_LEAVE: "bg-warning/10 text-warning border-warning/20",
  TERMINATED: "bg-destructive/10 text-destructive border-destructive/20",
}

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    hireDate: "",
    salary: "",
    status: "ACTIVE" as EmployeeStatus,
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  async function fetchEmployees() {
    try {
      const response = await fetch("/api/employees")
      const result = await response.json()
      if (result.success) {
        setEmployees(result.data)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          department: formData.department,
          position: formData.position,
          hireDate: formData.hireDate,
          salary: formData.salary ? parseFloat(formData.salary) : undefined,
          status: formData.status,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Employee added successfully")
        setIsDialogOpen(false)
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          department: "",
          position: "",
          hireDate: "",
          salary: "",
          status: "ACTIVE",
        })
        fetchEmployees()
      } else {
        toast.error(result.error || "Failed to add employee")
      }
    } catch (error) {
      console.error("Error adding employee:", error)
      toast.error("Failed to add employee")
    }
  }

  const departments = [...new Set(employees.map((e) => e.department))]

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(search.toLowerCase()) || employee.email.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = department === "all" || employee.department === department
    return matchesSearch && matchesDepartment
  })

  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (employee: Employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {employee.firstName.charAt(0)}
              {employee.lastName.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{employee.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (employee: Employee) => (
        <div>
          <p className="font-medium">{employee.department}</p>
          <p className="text-xs text-muted-foreground">{employee.position}</p>
        </div>
      ),
    },
    {
      key: "hireDate",
      header: "Hire Date",
      render: (employee: Employee) => <span className="text-sm">{formatDate(employee.hireDate)}</span>,
    },
    {
      key: "salary",
      header: "Salary",
      render: (employee: Employee) => (
        <span className="font-medium">{employee.salary ? formatCurrency(employee.salary) : "-"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (employee: Employee) => (
        <Badge variant="outline" className={statusColors[employee.status]}>
          {employee.status.toLowerCase().replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <Button variant="ghost" size="sm">
          View
        </Button>
      ),
      className: "text-right",
    },
  ]

  const activeCount = employees.filter((e) => e.status === "ACTIVE").length
  const onLeaveCount = employees.filter((e) => e.status === "ON_LEAVE").length

  if (loading) {
    return (
      <AppLayout title="Human Resources" description="Manage your employees and departments">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading employees...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Human Resources" description="Manage your employees and departments">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@retailflow.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Accounting">Accounting</SelectItem>
                      {departments
                        .filter((d) => !["Management", "Sales", "Warehouse", "Accounting"].includes(d))
                        .map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    placeholder="Sales Associate"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hireDate">Hire Date *</Label>
                  <Input
                    id="hireDate"
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="50000"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="555-0100"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Employee</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{employees.length}</p>
              <p className="text-xs text-muted-foreground">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Briefcase className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Users className="w-4 h-4 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{onLeaveCount}</p>
              <p className="text-xs text-muted-foreground">On Leave</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-5/10">
              <Building2 className="w-4 h-4 text-chart-5" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{departments.length}</p>
              <p className="text-xs text-muted-foreground">Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredEmployees} columns={columns} keyField="id" total={filteredEmployees.length} />
    </AppLayout>
  )
}
