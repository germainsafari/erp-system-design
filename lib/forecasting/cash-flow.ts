// Cash Flow Forecasting Service
// Uses historical data and patterns to predict future cash flow

import { prisma } from "@/lib/db"

export interface CashFlowForecast {
  date: string
  projectedBalance: number
  income: number
  expenses: number
  confidence: "high" | "medium" | "low"
  alerts: string[]
}

export interface CashFlowForecastResponse {
  currentBalance: number
  forecast: CashFlowForecast[]
  warnings: {
    critical: number
    warning: number
  }
  insights: string[]
}

/**
 * Calculate current cash balance from transactions
 */
async function getCurrentBalance(): Promise<number> {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  })

  return transactions.reduce((balance, txn) => {
    if (txn.type === "INCOME") return balance + Number(txn.amount)
    return balance - Number(txn.amount)
  }, 0)
}

/**
 * Get average daily income/expenses from historical data
 */
function calculateDailyAverages(transactions: any[], days: number) {
  const income = transactions.filter((t) => t.type === "INCOME")
  const expenses = transactions.filter((t) => t.type === "EXPENSE")

  const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0)

  return {
    avgDailyIncome: totalIncome / days,
    avgDailyExpenses: totalExpenses / days,
  }
}

/**
 * Detect recurring transactions (same amount, similar timing)
 */
function detectRecurringTransactions(transactions: any[]) {
  const recurring: Array<{ amount: number; type: "INCOME" | "EXPENSE"; dayOfMonth?: number }> = []

  // Group by amount and type
  const groups = new Map<string, any[]>()
  transactions.forEach((t) => {
    const key = `${t.type}-${Number(t.amount).toFixed(2)}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  })

  // Find patterns (same amount appears 3+ times)
  groups.forEach((group, key) => {
    if (group.length >= 3) {
      const [type, amount] = key.split("-")
      const dayOfMonth = Math.round(
        group.reduce((sum, t) => sum + new Date(t.date).getDate(), 0) / group.length
      )
      recurring.push({
        amount: parseFloat(amount),
        type: type as "INCOME" | "EXPENSE",
        dayOfMonth,
      })
    }
  })

  return recurring
}

/**
 * Predict future income from pending orders
 */
async function predictIncomeFromOrders(daysAhead: number): Promise<Map<string, number>> {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + daysAhead)

  const pendingOrders = await prisma.salesOrder.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: {
      customer: true,
    },
  })

  const dailyIncome = new Map<string, number>()

  // Estimate payment timing (average 7 days after order for pending, 3 days for confirmed)
  pendingOrders.forEach((order) => {
    const orderDate = new Date(order.orderDate)
    const paymentDays = order.status === "PENDING" ? 7 : 3
    const paymentDate = new Date(orderDate)
    paymentDate.setDate(paymentDate.getDate() + paymentDays)

    if (paymentDate <= endDate) {
      const dateKey = paymentDate.toISOString().split("T")[0]
      const current = dailyIncome.get(dateKey) || 0
      dailyIncome.set(dateKey, current + Number(order.total))
    }
  })

  return dailyIncome
}

/**
 * Predict future expenses from purchase orders
 */
async function predictExpensesFromPOs(daysAhead: number): Promise<Map<string, number>> {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + daysAhead)

  const pendingPOs = await prisma.purchaseOrder.findMany({
    where: {
      status: { in: ["APPROVED", "ORDERED"] },
    },
  })

  const dailyExpenses = new Map<string, number>()

  pendingPOs.forEach((po) => {
    // Use expected date if available, otherwise estimate 14 days
    const paymentDate = po.expectedDate
      ? new Date(po.expectedDate)
      : new Date(po.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000)

    if (paymentDate <= endDate) {
      const dateKey = paymentDate.toISOString().split("T")[0]
      const current = dailyExpenses.get(dateKey) || 0
      dailyExpenses.set(dateKey, current + Number(po.total))
    }
  })

  return dailyExpenses
}

/**
 * Generate cash flow forecast for the next N days
 */
export async function generateCashFlowForecast(days: number = 90): Promise<CashFlowForecastResponse> {
  const currentBalance = await getCurrentBalance()

  // Get historical transactions (last 90 days)
  const historyDays = Math.min(90, days)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - historyDays)

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  })

  const { avgDailyIncome, avgDailyExpenses } = calculateDailyAverages(transactions, historyDays)
  const recurring = detectRecurringTransactions(transactions)

  // Get predicted income/expenses from orders
  const predictedIncome = await predictIncomeFromOrders(days)
  const predictedExpenses = await predictExpensesFromPOs(days)

  // Generate forecast
  const forecast: CashFlowForecast[] = []
  const today = new Date()
  let runningBalance = currentBalance
  let criticalWarnings = 0
  let warningCount = 0
  const insights: string[] = []

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(today)
    forecastDate.setDate(forecastDate.getDate() + i)
    const dateKey = forecastDate.toISOString().split("T")[0]
    const dayOfMonth = forecastDate.getDate()

    // Calculate income for this day
    let dayIncome = predictedIncome.get(dateKey) || 0

    // Add recurring income
    recurring
      .filter((r) => r.type === "INCOME" && Math.abs((r.dayOfMonth || 0) - dayOfMonth) <= 2)
      .forEach((r) => {
        dayIncome += r.amount
      })

    // If no specific prediction, use average
    if (dayIncome === 0) {
      dayIncome = avgDailyIncome
    }

    // Calculate expenses for this day
    let dayExpenses = predictedExpenses.get(dateKey) || 0

    // Add recurring expenses
    recurring
      .filter((r) => r.type === "EXPENSE" && Math.abs((r.dayOfMonth || 0) - dayOfMonth) <= 2)
      .forEach((r) => {
        dayExpenses += r.amount
      })

    // If no specific prediction, use average
    if (dayExpenses === 0) {
      dayExpenses = avgDailyExpenses
    }

    // Calculate new balance
    runningBalance = runningBalance + dayIncome - dayExpenses

    // Determine confidence
    let confidence: "high" | "medium" | "low" = "medium"
    if (predictedIncome.has(dateKey) || predictedExpenses.has(dateKey)) {
      confidence = "high"
    } else if (recurring.some((r) => Math.abs((r.dayOfMonth || 0) - dayOfMonth) <= 2)) {
      confidence = "medium"
    } else {
      confidence = "low"
    }

    // Generate alerts
    const alerts: string[] = []
    if (runningBalance < 0) {
      alerts.push("Negative balance predicted")
      criticalWarnings++
    } else if (runningBalance < currentBalance * 0.2) {
      alerts.push("Low cash warning")
      warningCount++
    }

    forecast.push({
      date: dateKey,
      projectedBalance: Math.round(runningBalance * 100) / 100,
      income: Math.round(dayIncome * 100) / 100,
      expenses: Math.round(dayExpenses * 100) / 100,
      confidence,
      alerts,
    })
  }

  // Generate insights
  const minBalance = Math.min(...forecast.map((f) => f.projectedBalance))
  if (minBalance < 0) {
    insights.push(`⚠️ Cash flow may go negative in ${forecast.findIndex((f) => f.projectedBalance < 0) + 1} days`)
  } else if (minBalance < currentBalance * 0.2) {
    insights.push(`Lowest predicted balance: ${minBalance.toFixed(2)} (${((minBalance / currentBalance) * 100).toFixed(0)}% of current)`)
  }

  const totalPredictedIncome = Array.from(predictedIncome.values()).reduce((sum, val) => sum + val, 0)
  const totalPredictedExpenses = Array.from(predictedExpenses.values()).reduce((sum, val) => sum + val, 0)

  if (totalPredictedIncome > 0) {
    insights.push(`💰 ${totalPredictedIncome.toFixed(2)} in pending order payments expected`)
  }
  if (totalPredictedExpenses > 0) {
    insights.push(`💸 ${totalPredictedExpenses.toFixed(2)} in purchase orders pending`)
  }

  if (recurring.length > 0) {
    insights.push(`🔄 Detected ${recurring.length} recurring transaction patterns`)
  }

  return {
    currentBalance,
    forecast,
    warnings: {
      critical: criticalWarnings,
      warning: warningCount,
    },
    insights,
  }
}


