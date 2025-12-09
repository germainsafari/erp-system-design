import { prisma } from "@/lib/db"
import type { Role } from "@/lib/types"

interface OperationalSnapshot {
  stats: string
  lowStock: string
  pendingOrders: string
}

async function fetchStats(): Promise<string> {
  try {
    const [income, orders, products, customers] = await Promise.all([
      prisma.transaction.findMany({ where: { type: "INCOME" } }),
      prisma.salesOrder.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.customer.count(),
    ])

    const totalRevenue = income.reduce((sum, t) => sum + Number(t.amount), 0)

    return `Revenue ${totalRevenue.toFixed(2)}, Orders ${orders}, Active products ${products}, Customers ${customers}.`
  } catch (error) {
    console.error("AI context stats error:", error)
    return "Stats unavailable."
  }
}

async function fetchLowStock(): Promise<string> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { inventoryEntries: { select: { quantity: true, type: true } } },
    })

    const withStock = products.map((p) => {
      const current = p.inventoryEntries.reduce((sum, entry) => {
        if (entry.type === "IN") return sum + entry.quantity
        if (entry.type === "OUT") return sum - entry.quantity
        return sum + entry.quantity
      }, 0)
      return { name: p.name, sku: p.sku, current, min: p.minStock }
    })

    const low = withStock.filter((p) => p.current < p.min).slice(0, 8)
    if (!low.length) return "No low stock alerts."

    return low
      .map((p) => `${p.name} (SKU ${p.sku}) stock ${p.current}, min ${p.min}`)
      .join("; ")
  } catch (error) {
    console.error("AI context low stock error:", error)
    return "Low stock data unavailable."
  }
}

async function fetchPendingOrders(): Promise<string> {
  try {
    const pendingOrders = await prisma.salesOrder.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    })

    if (!pendingOrders.length) return "No pending sales orders."

    return pendingOrders
      .map((order) => {
        const customer = order.customer?.name || "Unknown customer"
        return `${order.orderNumber} for ${customer} status ${order.status} total ${Number(order.total).toFixed(2)}`
      })
      .join("; ")
  } catch (error) {
    console.error("AI context pending orders error:", error)
    return "Pending orders unavailable."
  }
}

export async function buildOperationalContext(role?: Role): Promise<OperationalSnapshot> {
  const [stats, lowStock, pendingOrders] = await Promise.all([fetchStats(), fetchLowStock(), fetchPendingOrders()])

  return {
    stats: `Key stats: ${stats}`,
    lowStock: `Low stock: ${lowStock}`,
    pendingOrders: `Pending orders: ${pendingOrders}`,
  }
}

