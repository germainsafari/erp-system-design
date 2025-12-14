// Intelligent Automated Reordering Service
// Uses ML-based demand forecasting to predict stockouts and suggest optimal reorder quantities

import { prisma } from "@/lib/db"

export interface ReorderSuggestion {
  productId: string
  productSku: string
  productName: string
  currentStock: number
  minStock: number
  salesVelocity: number // units per week
  predictedStockoutDate: Date | null
  suggestedQuantity: number
  reasoning: string[]
  urgency: "critical" | "high" | "medium" | "low"
  confidence: "high" | "medium" | "low"
  seasonalFactor: number // multiplier for seasonal demand
}

export interface ReorderSuggestionsResponse {
  suggestions: ReorderSuggestion[]
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

/**
 * Calculate current stock for a product
 */
async function getProductStock(productId: string): Promise<number> {
  const entries = await prisma.inventoryEntry.findMany({
    where: { productId },
  })

  return entries.reduce((sum, entry) => {
    if (entry.type === "IN") return sum + entry.quantity
    if (entry.type === "OUT") return sum - entry.quantity
    return sum + entry.quantity // ADJUSTMENT
  }, 0)
}

/**
 * Calculate sales velocity (units sold per week) from historical orders
 */
async function calculateSalesVelocity(productId: string): Promise<number> {
  const now = new Date()
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

  // Get sales order items for this product in last 60 days
  const orderItems = await prisma.salesOrderItem.findMany({
    where: {
      productId,
      order: {
        status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
        orderDate: { gte: sixtyDaysAgo },
      },
    },
    include: {
      order: {
        select: {
          orderDate: true,
        },
      },
    },
  })

  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0)
  const weeksOfData = Math.max(1, (now.getTime() - sixtyDaysAgo.getTime()) / (7 * 24 * 60 * 60 * 1000))

  return totalQuantity / weeksOfData
}

/**
 * Detect seasonal patterns in sales
 */
function detectSeasonality(historicalSales: Array<{ date: Date; quantity: number }>): number {
  if (historicalSales.length < 12) return 1.0 // Not enough data

  const now = new Date()
  const currentMonth = now.getMonth()

  // Calculate average sales per month
  const monthlySales = new Map<number, number[]>()
  historicalSales.forEach((sale) => {
    const month = new Date(sale.date).getMonth()
    if (!monthlySales.has(month)) monthlySales.set(month, [])
    monthlySales.get(month)!.push(sale.quantity)
  })

  if (monthlySales.size < 3) return 1.0

  // Calculate average for current month vs overall average
  const currentMonthSales = monthlySales.get(currentMonth) || []
  const avgCurrentMonth = currentMonthSales.reduce((sum, q) => sum + q, 0) / Math.max(1, currentMonthSales.length)

  const allSales = Array.from(monthlySales.values()).flat()
  const overallAvg = allSales.reduce((sum, q) => sum + q, 0) / allSales.length

  if (overallAvg === 0) return 1.0

  return Math.max(0.5, Math.min(2.0, avgCurrentMonth / overallAvg))
}

/**
 * Predict when stockout will occur
 */
function predictStockoutDate(
  currentStock: number,
  salesVelocity: number,
  seasonalFactor: number = 1.0
): Date | null {
  if (salesVelocity <= 0) return null

  const adjustedVelocity = salesVelocity * seasonalFactor
  const daysUntilStockout = Math.floor((currentStock / adjustedVelocity) * 7)

  if (daysUntilStockout <= 0 || daysUntilStockout > 180) return null

  const stockoutDate = new Date()
  stockoutDate.setDate(stockoutDate.getDate() + daysUntilStockout)
  return stockoutDate
}

/**
 * Calculate optimal reorder quantity
 */
function calculateOptimalReorderQuantity(
  currentStock: number,
  minStock: number,
  salesVelocity: number,
  seasonalFactor: number,
  supplierLeadTime: number = 14 // days
): number {
  const adjustedVelocity = salesVelocity * seasonalFactor
  const weeklyDemand = adjustedVelocity

  // Calculate safety stock (enough for 2 weeks)
  const safetyStock = Math.max(minStock, Math.ceil(weeklyDemand * 2))

  // Calculate demand during lead time
  const demandDuringLeadTime = Math.ceil((weeklyDemand / 7) * supplierLeadTime)

  // Target stock level = safety stock + demand during lead time
  const targetStock = safetyStock + demandDuringLeadTime

  // Reorder quantity = target stock - current stock
  const reorderQuantity = Math.max(1, targetStock - currentStock)

  // Round up to nearest 5 for cleaner ordering
  return Math.ceil(reorderQuantity / 5) * 5
}

/**
 * Generate intelligent reorder suggestions
 */
export async function generateReorderSuggestions(): Promise<ReorderSuggestionsResponse> {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: {
      inventoryEntries: true,
      salesOrderItems: {
        where: {
          order: {
            status: { in: ["CONFIRMED", "SHIPPED", "DELIVERED"] },
          },
        },
        include: {
          order: {
            select: {
              orderDate: true,
            },
          },
        },
        take: 100, // Last 100 orders for seasonality calculation
        orderBy: {
          order: {
            orderDate: "desc",
          },
        },
      },
    },
  })

  const suggestions: ReorderSuggestion[] = []

  for (const product of products) {
    const currentStock = await getProductStock(product.id)
    const salesVelocity = await calculateSalesVelocity(product.id)

    // Only suggest reordering if stock is below minimum or predicted to go below soon
    const isBelowMin = currentStock < product.minStock

    // Get historical sales for seasonality
    const historicalSales = product.salesOrderItems.map((item) => ({
      date: item.order.orderDate,
      quantity: item.quantity,
    }))

    const seasonalFactor = detectSeasonality(historicalSales)

    // Predict stockout date
    const predictedStockoutDate = predictStockoutDate(currentStock, salesVelocity, seasonalFactor)

    // Only suggest if stock is low or stockout predicted within 30 days
    const stockoutIn30Days = predictedStockoutDate
      ? (predictedStockoutDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000) <= 30
      : false

    if (!isBelowMin && !stockoutIn30Days && salesVelocity > 0) {
      continue // Skip products that are well-stocked
    }

    // Calculate optimal reorder quantity
    const suggestedQuantity = calculateOptimalReorderQuantity(
      currentStock,
      product.minStock,
      salesVelocity,
      seasonalFactor
    )

    // Build reasoning
    const reasoning: string[] = []
    if (isBelowMin) {
      reasoning.push(`Stock (${currentStock}) is below minimum (${product.minStock})`)
    }
    if (predictedStockoutDate) {
      const daysUntilStockout = Math.ceil(
        (predictedStockoutDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
      )
      reasoning.push(`Stockout predicted in ${daysUntilStockout} days`)
    }
    if (salesVelocity > 0) {
      reasoning.push(`Selling ${salesVelocity.toFixed(1)} units/week`)
    }
    if (seasonalFactor > 1.1) {
      reasoning.push(`Seasonal demand increase detected (${(seasonalFactor * 100).toFixed(0)}% of average)`)
    } else if (seasonalFactor < 0.9) {
      reasoning.push(`Seasonal demand decrease (${(seasonalFactor * 100).toFixed(0)}% of average)`)
    }

    // Determine urgency
    let urgency: "critical" | "high" | "medium" | "low" = "low"
    if (currentStock < product.minStock * 0.5) {
      urgency = "critical"
    } else if (currentStock < product.minStock || (predictedStockoutDate && predictedStockoutDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000)) {
      urgency = "high"
    } else if (predictedStockoutDate && predictedStockoutDate.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000) {
      urgency = "medium"
    }

    // Determine confidence
    let confidence: "high" | "medium" | "low" = "medium"
    if (salesVelocity > 0 && historicalSales.length >= 20) {
      confidence = "high"
    } else if (salesVelocity > 0 && historicalSales.length >= 5) {
      confidence = "medium"
    } else {
      confidence = "low"
      reasoning.push("Limited sales history - suggestion based on minimum stock levels")
    }

    suggestions.push({
      productId: product.id,
      productSku: product.sku,
      productName: product.name,
      currentStock,
      minStock: product.minStock,
      salesVelocity: Math.round(salesVelocity * 10) / 10,
      predictedStockoutDate,
      suggestedQuantity,
      reasoning,
      urgency,
      confidence,
      seasonalFactor: Math.round(seasonalFactor * 100) / 100,
    })
  }

  // Sort by urgency
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  suggestions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

  // Calculate summary
  const summary = {
    critical: suggestions.filter((s) => s.urgency === "critical").length,
    high: suggestions.filter((s) => s.urgency === "high").length,
    medium: suggestions.filter((s) => s.urgency === "medium").length,
    low: suggestions.filter((s) => s.urgency === "low").length,
  }

  return {
    suggestions,
    summary,
  }
}







