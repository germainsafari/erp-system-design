import { NextResponse } from "next/server"
import { prisma, generateId, getProductCurrentStock } from "@/lib/db"
import { adjustInventorySchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = adjustInventorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    const { productId, quantity, type, reason } = validation.data

    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    const currentStock = await getProductCurrentStock(productId)

    // Validate stock for OUT adjustments
    if (type === "OUT" && currentStock + quantity < 0) {
      return NextResponse.json({ success: false, error: "Insufficient stock for adjustment" }, { status: 400 })
    }

    // Create inventory entry
    const entry = await prisma.inventoryEntry.create({
      data: {
        productId,
        quantity,
        type,
        reason: reason || null,
        createdBy: null, // Would be set from auth context
      },
      include: {
        product: true,
      },
    })

    // Calculate new stock
    const newStock = await getProductCurrentStock(productId)

    // Check for low stock alert
    const isLowStock = newStock < product.minStock

    return NextResponse.json({
      success: true,
      data: {
        entry: {
          ...entry,
          product: {
            ...entry.product,
            price: Number(entry.product.price),
            cost: Number(entry.product.cost),
          },
        },
        newStock,
        isLowStock,
      },
    })
  } catch (error) {
    console.error("Error adjusting inventory:", error)
    return NextResponse.json({ success: false, error: "Failed to adjust inventory" }, { status: 500 })
  }
}
