import { NextResponse } from "next/server"
import { prisma, generateId, getProductCurrentStock } from "@/lib/db"
import { updateSalesOrderStatusSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          product: {
            ...item.product,
            price: Number(item.product.price),
            cost: Number(item.product.cost),
          },
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = updateSalesOrderStatusSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    const { status } = validation.data

    // Handle status transitions
    if (status === "CONFIRMED" && order.status === "PENDING") {
      // Deduct inventory when order is confirmed
      for (const item of order.items) {
        const currentStock = await getProductCurrentStock(item.productId)

        if (currentStock < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for ${item.product.name}` },
            { status: 400 },
          )
        }

        // Create inventory entry for stock deduction
        await prisma.inventoryEntry.create({
          data: {
            productId: item.productId,
            quantity: -item.quantity,
            type: "OUT",
            reason: `Sales Order ${order.orderNumber}`,
            createdBy: null, // Would be set from auth context
          },
        })
      }
    }

    const updatedOrder = await prisma.salesOrder.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedOrder,
        total: Number(updatedOrder.total),
        items: updatedOrder.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.subtotal),
          product: {
            ...item.product,
            price: Number(item.product.price),
            cost: Number(item.product.cost),
          },
        })),
      },
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
  }
}
