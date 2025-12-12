// Database utility functions for RetailFlow ERP
// Prisma client for production use

import { PrismaClient } from "@prisma/client"
import type { DashboardStats } from "./types"

// Prisma Client singleton pattern for Next.js
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma Client with connection settings optimized for serverless
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool settings for serverless environments
    // Note: These are handled by the connection string for Neon pooler
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Test database connection on startup (development only)
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  prisma.$connect().catch((error) => {
    console.error("❌ Failed to connect to database:", error.message)
    console.error("💡 Make sure:")
    console.error("   1. DATABASE_URL is set in .env file")
    console.error("   2. Your Neon database is active (not paused)")
    console.error("   3. The connection string is correct")
    if (error.message.includes("Can't reach database server")) {
      console.error("   4. Wake up your Neon database by visiting the Neon dashboard")
      console.error("   5. Check if you're using the correct pooler connection string")
    }
  })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  // This will be calculated from database in actual implementation
  return `SO-${year}-${Date.now().toString().slice(-4)}`
}

// ============================================
// DASHBOARD STATS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total revenue from income transactions
    const incomeTransactions = await prisma.transaction.findMany({
      where: { type: "INCOME" },
    })
    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

    // Get product count and low stock items
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        inventoryEntries: {
          select: {
            quantity: true,
            type: true,
          },
        },
      },
    })

    // Calculate current stock for each product
    const productsWithStock = products.map((product) => {
      const currentStock = product.inventoryEntries.reduce((sum, entry) => {
        if (entry.type === "IN") return sum + entry.quantity
        if (entry.type === "OUT") return sum - entry.quantity
        return sum + entry.quantity // ADJUSTMENT
      }, 0)
      return { ...product, currentStock }
    })

    const lowStockCount = productsWithStock.filter((p) => p.currentStock < p.minStock).length

    // Get pending orders count
    const pendingOrders = await prisma.salesOrder.count({
      where: { status: "PENDING" },
    })

    // Get total counts
    const totalOrders = await prisma.salesOrder.count()
    const totalProducts = await prisma.product.count({ where: { active: true } })
    const totalCustomers = await prisma.customer.count()

    // Calculate changes (simplified - in production, compare with previous period)
    const revenueChange = 12.5 // Would be calculated from historical data
    const ordersChange = 8.2 // Would be calculated from historical data

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
      pendingOrders,
      revenueChange,
      ordersChange,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    // Return default stats on error
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCustomers: 0,
      lowStockCount: 0,
      pendingOrders: 0,
      revenueChange: 0,
      ordersChange: 0,
    }
  }
}

// Helper function to calculate current stock for a product
export async function getProductCurrentStock(productId: string): Promise<number> {
  const entries = await prisma.inventoryEntry.findMany({
    where: { productId },
  })

  return entries.reduce((sum, entry) => {
    if (entry.type === "IN") return sum + entry.quantity
    if (entry.type === "OUT") return sum - entry.quantity
    return sum + entry.quantity // ADJUSTMENT
  }, 0)
}
