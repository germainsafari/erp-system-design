"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Supplier } from "@/lib/types"
import { Plus, Search, Truck, Mail, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  async function fetchSuppliers() {
    try {
      const response = await fetch("/api/suppliers")
      const result = await response.json()
      if (result.success) {
        setSuppliers(result.data)
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
      toast.error("Failed to load suppliers")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          contactName: formData.contactName || undefined,
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          active: true,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Supplier added successfully")
        setIsDialogOpen(false)
        setFormData({ name: "", contactName: "", email: "", phone: "", address: "" })
        fetchSuppliers()
      } else {
        toast.error(result.error || "Failed to add supplier")
      }
    } catch (error) {
      console.error("Error adding supplier:", error)
      toast.error("Failed to add supplier")
    }
  }

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.contactName?.toLowerCase().includes(search.toLowerCase()),
  )

  const columns = [
    {
      key: "name",
      header: "Supplier",
      render: (supplier: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{supplier.name}</p>
            {supplier.contactName && <p className="text-xs text-muted-foreground">Contact: {supplier.contactName}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Info",
      render: (supplier: Supplier) => (
        <div className="space-y-1">
          {supplier.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span>{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span>{supplier.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "address",
      header: "Address",
      render: (supplier: Supplier) => (
        <div className="flex items-start gap-2 max-w-xs">
          <MapPin className="w-3 h-3 text-muted-foreground mt-1 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">{supplier.address || "-"}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (supplier: Supplier) => (
        <Badge
          variant="outline"
          className={
            supplier.active ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"
          }
        >
          {supplier.active ? "Active" : "Inactive"}
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

  if (loading) {
    return (
      <AppLayout title="Suppliers" description="Manage your supplier relationships">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading suppliers...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Suppliers" description="Manage your supplier relationships">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter company name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input
                  id="contactName"
                  placeholder="Enter contact name"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter address"
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Supplier</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{suppliers.length}</p>
              <p className="text-sm text-muted-foreground">Total Suppliers</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Truck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{suppliers.filter((s) => s.active).length}</p>
              <p className="text-sm text-muted-foreground">Active Suppliers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredSuppliers} columns={columns} keyField="id" total={filteredSuppliers.length} />
    </AppLayout>
  )
}
