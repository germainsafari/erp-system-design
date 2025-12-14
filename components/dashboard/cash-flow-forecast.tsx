"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart, Tooltip } from "recharts"

interface CashFlowForecast {
  date: string
  projectedBalance: number
  income: number
  expenses: number
  confidence: "high" | "medium" | "low"
  alerts: string[]
}

interface CashFlowForecastResponse {
  currentBalance: number
  forecast: CashFlowForecast[]
  warnings: {
    critical: number
    warning: number
  }
  insights: string[]
}

export function CashFlowForecast() {
  const [forecast, setForecast] = useState<CashFlowForecastResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(90)

  useEffect(() => {
    async function fetchForecast() {
      try {
        setLoading(true)
        const response = await fetch(`/api/forecast/cash-flow?days=${days}`)
        const result = await response.json()
        if (result.success) {
          setForecast(result.data)
        }
      } catch (error) {
        console.error("Error fetching cash flow forecast:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchForecast()
  }, [days])

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
          <CardDescription>Predicting future cash flow based on historical patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading forecast...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!forecast) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Cash Flow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unable to generate forecast</AlertTitle>
            <AlertDescription>Please check your transaction data.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data (weekly aggregation for readability)
  const weeklyData = []
  const forecastArray = forecast.forecast
  for (let i = 0; i < forecastArray.length; i += 7) {
    const week = forecastArray.slice(i, i + 7)
    const weekStart = new Date(week[0].date)
    const avgBalance = week.reduce((sum, f) => sum + f.projectedBalance, 0) / week.length
    const minBalance = Math.min(...week.map((f) => f.projectedBalance))
    const maxBalance = Math.max(...week.map((f) => f.projectedBalance))

    weeklyData.push({
      week: `Week ${Math.floor(i / 7) + 1}`,
      date: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      balance: Math.round(avgBalance),
      min: Math.round(minBalance),
      max: Math.round(maxBalance),
      hasAlert: week.some((f) => f.alerts.length > 0),
    })
  }

  // Find critical periods
  const criticalPeriods = forecast.forecast.filter((f) => f.projectedBalance < 0)
  const lowPeriods = forecast.forecast.filter(
    (f) => f.projectedBalance >= 0 && f.projectedBalance < forecast.currentBalance * 0.2
  )

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Cash Flow Forecast
              <Badge variant="outline" className="text-xs">
                {days} days
              </Badge>
            </CardTitle>
            <CardDescription>AI-powered prediction based on historical patterns and pending orders</CardDescription>
          </div>
          <Select value={days.toString()} onValueChange={(val) => setDays(parseInt(val, 10))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance & Warnings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(forecast.currentBalance)}</p>
          </div>
          {forecast.warnings.critical > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical</AlertTitle>
              <AlertDescription>{forecast.warnings.critical} days with negative balance</AlertDescription>
            </Alert>
          )}
          {forecast.warnings.warning > 0 && forecast.warnings.critical === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>{forecast.warnings.warning} days with low cash</AlertDescription>
            </Alert>
          )}
          {forecast.warnings.critical === 0 && forecast.warnings.warning === 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Healthy</AlertTitle>
              <AlertDescription>No cash flow issues predicted</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Insights */}
        {forecast.insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Key Insights
            </h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {forecast.insights.map((insight, idx) => (
                <li key={idx}>• {insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Forecast Chart */}
        <div className="h-64 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Balance</span>
                            <span className="font-semibold">{formatCurrency(payload[0]?.value as number || 0)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorBalance)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Lowest Balance</p>
            <p className="text-lg font-semibold">
              {formatCurrency(Math.min(...forecast.forecast.map((f) => f.projectedBalance)))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Highest Balance</p>
            <p className="text-lg font-semibold">
              {formatCurrency(Math.max(...forecast.forecast.map((f) => f.projectedBalance)))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Daily Income</p>
            <p className="text-lg font-semibold text-success">
              {formatCurrency(
                forecast.forecast.reduce((sum, f) => sum + f.income, 0) / forecast.forecast.length
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Avg Daily Expenses</p>
            <p className="text-lg font-semibold text-destructive">
              {formatCurrency(
                forecast.forecast.reduce((sum, f) => sum + f.expenses, 0) / forecast.forecast.length
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

