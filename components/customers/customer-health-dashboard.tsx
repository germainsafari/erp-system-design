"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Heart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Mail } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { CustomerHealthScore } from "@/lib/forecasting/customer-health"

interface CustomerHealthResponse {
  customers: CustomerHealthScore[]
  summary: {
    healthy: number
    atRisk: number
    critical: number
  }
}

export function CustomerHealthDashboard() {
  const [healthData, setHealthData] = useState<CustomerHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHealthData() {
      try {
        setLoading(true)
        const response = await fetch("/api/customers/health")
        const result = await response.json()
        if (result.success) {
          setHealthData(result.data)
        }
      } catch (error) {
        console.error("Error fetching customer health data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchHealthData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading health scores...</p>
      </div>
    )
  }

  if (!healthData) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Unable to load health data</AlertTitle>
        <AlertDescription>Please check your customer and order data.</AlertDescription>
      </Alert>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-success/10 text-success border-success/20"
      case "at-risk":
        return "bg-warning/10 text-warning border-warning/20"
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-4 w-4" />
      case "at-risk":
        return <AlertTriangle className="h-4 w-4" />
      case "critical":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return null
    }
  }

  const atRiskCustomers = healthData.customers.filter((c) => c.status !== "healthy")
  const criticalCustomers = healthData.customers.filter((c) => c.status === "critical")

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Healthy Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{healthData.summary.healthy}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((healthData.summary.healthy / healthData.customers.length) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              At-Risk Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{healthData.summary.atRisk}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Critical Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{healthData.summary.critical}</div>
            <p className="text-xs text-muted-foreground mt-1">Immediate action needed</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Customers Alert */}
      {criticalCustomers.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Customers Requiring Attention</AlertTitle>
          <AlertDescription>
            {criticalCustomers.length} customer{criticalCustomers.length > 1 ? "s have" : " has"} a critical
            health score and may be at risk of churning. Review recommended actions below.
          </AlertDescription>
        </Alert>
      )}

      {/* At-Risk Customers Table */}
      {atRiskCustomers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Customers</CardTitle>
            <CardDescription>Customers needing attention to prevent churn</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>Trend</TableHead>
                  <TableHead>Risk Factors</TableHead>
                  <TableHead>Recommendations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {atRiskCustomers.slice(0, 20).map((customer) => (
                  <TableRow key={customer.customerId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.customerName}</p>
                        {customer.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(customer.status)}>
                          {getStatusIcon(customer.status)}
                          <span className="ml-1">{customer.healthScore}</span>
                        </Badge>
                        <Progress value={customer.healthScore} className="w-16 h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.lastOrderDate ? (
                        <div>
                          <p className="text-sm">{formatDate(customer.lastOrderDate)}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.daysSinceLastOrder} days ago
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">No orders</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatCurrency(customer.totalRevenue)}</p>
                        <p className="text-xs text-muted-foreground">{customer.totalOrders} orders</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.trend === "improving" ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Improving
                        </Badge>
                      ) : customer.trend === "declining" ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Declining
                        </Badge>
                      ) : (
                        <Badge variant="outline">Stable</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.riskFactors.length > 0 ? (
                        <ul className="text-xs space-y-1">
                          {customer.riskFactors.slice(0, 2).map((factor, idx) => (
                            <li key={idx} className="text-muted-foreground">
                              • {factor}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.recommendations.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground max-w-xs">
                            {customer.recommendations[0]}
                          </p>
                          {customer.email && (
                            <Button variant="ghost" size="sm" className="h-6 text-xs">
                              <Mail className="h-3 w-3 mr-1" />
                              Email
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Monitor</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>All Customers Healthy</AlertTitle>
          <AlertDescription>No at-risk customers detected. Great job maintaining customer relationships!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}




