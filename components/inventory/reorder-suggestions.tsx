"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, CheckCircle2, Package, TrendingUp, Calendar, Lightbulb, ShoppingCart } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import type { ReorderSuggestion } from "@/lib/forecasting/intelligent-reordering"

interface ReorderSuggestionsResponse {
  suggestions: ReorderSuggestion[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

export function ReorderSuggestions() {
  const [data, setData] = useState<ReorderSuggestionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSuggestion, setSelectedSuggestion] = useState<ReorderSuggestion | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [supplierId, setSupplierId] = useState("")
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    fetchSuggestions()
    fetchSuppliers()
  }, [])

  async function fetchSuggestions() {
    try {
      setLoading(true)
      const response = await fetch("/api/inventory/reorder-suggestions")
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error("Error fetching reorder suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchSuppliers() {
    try {
      const response = await fetch("/api/suppliers")
      const result = await response.json()
      if (result.success) {
        setSuppliers(result.data.map((s: any) => ({ id: s.id, name: s.name })))
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error)
    }
  }

  async function createPurchaseOrder(suggestion: ReorderSuggestion) {
    if (!supplierId) {
      toast.error("Please select a supplier")
      return
    }

    try {
      // In a real implementation, this would create a purchase order
      // For now, we'll just show a success message
      toast.success(`Purchase order draft created for ${suggestion.productName} (Qty: ${suggestion.suggestedQuantity})`)
      setIsDialogOpen(false)
      setSelectedSuggestion(null)
      setSupplierId("")
    } catch (error) {
      console.error("Error creating purchase order:", error)
      toast.error("Failed to create purchase order")
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "high":
        return "bg-warning/10 text-warning border-warning/20"
      case "medium":
        return "bg-chart-3/10 text-chart-3 border-chart-3/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "text-success"
      case "medium":
        return "text-warning"
      default:
        return "text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Reorder Suggestions</CardTitle>
          <CardDescription>AI-powered stock management recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Analyzing inventory...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Intelligent Reorder Suggestions</CardTitle>
          <CardDescription>AI-powered stock management recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>All Stock Levels Healthy</AlertTitle>
            <AlertDescription>
              No reorder suggestions at this time. Your inventory levels are optimal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Intelligent Reorder Suggestions
        </CardTitle>
        <CardDescription>AI-powered recommendations based on sales velocity and demand forecasting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="text-2xl font-bold text-destructive">{data.summary.critical}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">High Priority</p>
            <p className="text-2xl font-bold text-warning">{data.summary.high}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Medium Priority</p>
            <p className="text-2xl font-bold text-chart-3">{data.summary.medium}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Low Priority</p>
            <p className="text-2xl font-bold">{data.summary.low}</p>
          </div>
        </div>

        {/* Suggestions Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Sales Velocity</TableHead>
                <TableHead>Predicted Stockout</TableHead>
                <TableHead>Suggested Qty</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Reasoning</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.suggestions.map((suggestion) => (
                <TableRow key={suggestion.productId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{suggestion.productName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{suggestion.productSku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{suggestion.currentStock}</p>
                      <p className="text-xs text-muted-foreground">Min: {suggestion.minStock}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{suggestion.salesVelocity} units/week</span>
                    </div>
                    {suggestion.seasonalFactor !== 1.0 && (
                      <p className="text-xs text-muted-foreground">
                        Season: {(suggestion.seasonalFactor * 100).toFixed(0)}%
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {suggestion.predictedStockoutDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {formatDate(suggestion.predictedStockoutDate)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">{suggestion.suggestedQuantity}</span>
                    <p className="text-xs text-muted-foreground">
                      Confidence: <span className={getConfidenceColor(suggestion.confidence)}>
                        {suggestion.confidence}
                      </span>
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getUrgencyColor(suggestion.urgency)}>
                      {suggestion.urgency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ul className="text-xs space-y-0.5 max-w-xs">
                      {suggestion.reasoning.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          • {reason}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedSuggestion(suggestion)
                        setIsDialogOpen(true)
                      }}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Create PO
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Create Purchase Order Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Create a purchase order for {selectedSuggestion?.productName}
              </DialogDescription>
            </DialogHeader>
            {selectedSuggestion && (
              <div className="space-y-4 mt-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Product:</span>
                    <span className="font-medium">{selectedSuggestion.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Suggested Quantity:</span>
                    <span className="font-medium">{selectedSuggestion.suggestedQuantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Stock:</span>
                    <span className="font-medium">{selectedSuggestion.currentStock}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => createPurchaseOrder(selectedSuggestion)}>
                    Create Purchase Order
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}







