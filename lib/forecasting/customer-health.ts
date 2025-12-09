// Customer Health Score & Churn Prediction Service
// Calculates health scores and predicts churn risk for customers

import { prisma } from "@/lib/db"

export interface CustomerHealthScore {
  customerId: string
  customerName: string
  email?: string | null
  healthScore: number // 0-100
  status: "healthy" | "at-risk" | "critical"
  lastOrderDate: Date | null
  daysSinceLastOrder: number | null
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  orderFrequency: number // orders per month
  trend: "improving" | "stable" | "declining"
  riskFactors: string[]
  recommendations: string[]
}

export interface CustomerHealthResponse {
  customers: CustomerHealthScore[]
  summary: {
    healthy: number
    atRisk: number
    critical: number
  }
}

/**
 * Calculate customer health score based on multiple factors
 */
export async function calculateCustomerHealthScores(): Promise<CustomerHealthResponse> {
  const customers = await prisma.customer.findMany({
    include: {
      salesOrders: {
        orderBy: { orderDate: "desc" },
        include: {
          items: true,
        },
      },
    },
  })

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const healthScores: CustomerHealthScore[] = customers.map((customer) => {
    const orders = customer.salesOrders
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get last order date
    const lastOrder = orders[0] || null
    const lastOrderDate = lastOrder?.orderDate || null
    const daysSinceLastOrder = lastOrderDate
      ? Math.floor((now.getTime() - lastOrderDate.getTime()) / (24 * 60 * 60 * 1000))
      : null

    // Calculate order frequency (orders per month)
    const firstOrderDate = orders[orders.length - 1]?.orderDate || now
    const monthsActive = Math.max(
      1,
      (now.getTime() - firstOrderDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
    )
    const orderFrequency = totalOrders / monthsActive

    // Recent orders (last 30 days)
    const recentOrders = orders.filter((o) => o.orderDate >= thirtyDaysAgo).length
    const orders30To60DaysAgo = orders.filter(
      (o) => o.orderDate >= sixtyDaysAgo && o.orderDate < thirtyDaysAgo
    ).length

    // Calculate trend
    let trend: "improving" | "stable" | "declining" = "stable"
    if (recentOrders > orders30To60DaysAgo * 1.2) {
      trend = "improving"
    } else if (recentOrders < orders30To60DaysAgo * 0.8) {
      trend = "declining"
    }

    // Risk factors
    const riskFactors: string[] = []
    const recommendations: string[] = []

    // Calculate health score (0-100)
    let score = 50 // Base score

    // Factor 1: Recency (30 points)
    if (!lastOrderDate || daysSinceLastOrder === null) {
      score -= 20
      riskFactors.push("No orders yet")
      recommendations.push("Send welcome offer to encourage first purchase")
    } else if (daysSinceLastOrder <= 30) {
      score += 25
    } else if (daysSinceLastOrder <= 60) {
      score += 15
    } else if (daysSinceLastOrder <= 90) {
      score += 5
      riskFactors.push(`No order in ${daysSinceLastOrder} days`)
      recommendations.push("Send re-engagement email with personalized offers")
    } else {
      score -= 15
      riskFactors.push(`No order in ${daysSinceLastOrder} days (high churn risk)`)
      recommendations.push("Immediate action needed: Schedule sales call or send win-back offer")
    }

    // Factor 2: Frequency (25 points)
    if (orderFrequency >= 2) {
      score += 25
    } else if (orderFrequency >= 1) {
      score += 15
    } else if (orderFrequency >= 0.5) {
      score += 5
    } else if (totalOrders === 0) {
      score -= 10
    } else {
      riskFactors.push("Low order frequency")
      recommendations.push("Consider subscription or loyalty program")
    }

    // Factor 3: Value (25 points)
    if (averageOrderValue > 500) {
      score += 25
    } else if (averageOrderValue > 200) {
      score += 15
    } else if (averageOrderValue > 100) {
      score += 5
    } else if (totalOrders > 0) {
      riskFactors.push("Low average order value")
      recommendations.push("Suggest product bundles or upsells")
    }

    // Factor 4: Trend (20 points)
    if (trend === "improving") {
      score += 20
    } else if (trend === "stable" && totalOrders > 3) {
      score += 10
    } else if (trend === "declining") {
      score -= 10
      riskFactors.push("Declining order frequency")
      recommendations.push("Investigate reason for decline and offer incentives")
    }

    // Factor 5: Total relationship value
    if (totalRevenue > 10000) {
      score += 10
    } else if (totalRevenue > 5000) {
      score += 5
    }

    // Normalize score to 0-100
    score = Math.max(0, Math.min(100, score))

    // Determine status
    let status: "healthy" | "at-risk" | "critical"
    if (score >= 70) {
      status = "healthy"
    } else if (score >= 40) {
      status = "at-risk"
    } else {
      status = "critical"
    }

    // Add default recommendations if none exist
    if (recommendations.length === 0 && status !== "healthy") {
      recommendations.push("Monitor customer closely and maintain regular communication")
    }

    return {
      customerId: customer.id,
      customerName: customer.name,
      email: customer.email,
      healthScore: Math.round(score),
      status,
      lastOrderDate,
      daysSinceLastOrder,
      totalOrders,
      totalRevenue,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      orderFrequency: Math.round(orderFrequency * 100) / 100,
      trend,
      riskFactors,
      recommendations,
    }
  })

  // Sort by health score (lowest first - prioritize at-risk customers)
  healthScores.sort((a, b) => a.healthScore - b.healthScore)

  // Calculate summary
  const summary = {
    healthy: healthScores.filter((c) => c.status === "healthy").length,
    atRisk: healthScores.filter((c) => c.status === "at-risk").length,
    critical: healthScores.filter((c) => c.status === "critical").length,
  }

  return {
    customers: healthScores,
    summary,
  }
}

