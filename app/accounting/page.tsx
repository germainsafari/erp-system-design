"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/layout/app-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"

export default function AccountingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [type, setType] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netProfit: 0 })
  const [formData, setFormData] = useState({
    type: "INCOME" as "INCOME" | "EXPENSE",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    try {
      const response = await fetch("/api/transactions")
      const result = await response.json()
      if (result.success) {
        setTransactions(result.data)
        if (result.summary) {
          setSummary(result.summary)
        }
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description || undefined,
          date: formData.date,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Transaction added successfully")
        setIsDialogOpen(false)
        setFormData({
          type: "INCOME",
          amount: "",
          category: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        })
        fetchTransactions()
      } else {
        toast.error(result.error || "Failed to add transaction")
      }
    } catch (error) {
      console.error("Error adding transaction:", error)
      toast.error("Failed to add transaction")
    }
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.category.toLowerCase().includes(search.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(search.toLowerCase())
    const matchesType = type === "all" || transaction.type === type
    return matchesSearch && matchesType
  })

  const columns = [
    {
      key: "date",
      header: "Date",
      render: (transaction: Transaction) => <span className="text-sm">{formatDate(transaction.date)}</span>,
    },
    {
      key: "type",
      header: "Type",
      render: (transaction: Transaction) => (
        <div className="flex items-center gap-2">
          {transaction.type === "INCOME" ? (
            <ArrowUpRight className="w-4 h-4 text-success" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-destructive" />
          )}
          <Badge
            variant="outline"
            className={
              transaction.type === "INCOME"
                ? "bg-success/10 text-success border-success/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            }
          >
            {transaction.type.toLowerCase()}
          </Badge>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (transaction: Transaction) => <span className="font-medium">{transaction.category}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (transaction: Transaction) => (
        <p className="text-sm text-muted-foreground max-w-xs truncate">{transaction.description || "-"}</p>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (transaction: Transaction) => (
        <span className={`font-medium ${transaction.type === "INCOME" ? "text-success" : "text-destructive"}`}>
          {transaction.type === "INCOME" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </span>
      ),
      className: "text-right",
    },
  ]

  const categories = [...new Set(transactions.map((t) => t.category))]

  if (loading) {
    return (
      <AppLayout title="Accounting" description="Track your income, expenses, and financial reports">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Accounting" description="Track your income, expenses, and financial reports">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-2xl font-semibold text-success">{formatCurrency(summary.totalIncome)}</p>
              </div>
              <div className="p-3 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-semibold text-destructive">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-semibold ${summary.netProfit >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(summary.netProfit)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as "INCOME" | "EXPENSE" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Inventory">Inventory</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      {categories
                        .filter((c) => !["Sales", "Inventory", "Operations", "Marketing"].includes(c))
                        .map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Transaction</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable data={filteredTransactions} columns={columns} keyField="id" total={filteredTransactions.length} />
        </CardContent>
      </Card>
    </AppLayout>
  )
}
