import { NextResponse } from "next/server"
import { prisma, generateId, generateOrderNumber, getProductCurrentStock } from "@/lib/db"
import { createSalesOrderSchema } from "@/lib/validators"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const customerId = searchParams.get("customerId")
    const search = searchParams.get("search")

    const where: any = {}

    if (status && status !== "all") {
      where.status = status
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const orders = await prisma.salesOrder.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    })

    const formattedOrders = orders.map((order) => ({
      ...order,
      total: Number(order.total),
      customer: order.customer,
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
    }))

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      total: formattedOrders.length,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = createSalesOrderSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    const { customerId, items, notes } = validation.data

    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    })

    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer not found" }, { status: 400 })
    }

    // Validate products and stock
    const orderItems: Array<{
      productId: string
      quantity: number
      unitPrice: number
      subtotal: number
    }> = []
    let total = 0

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return NextResponse.json({ success: false, error: `Product ${item.productId} not found` }, { status: 400 })
      }

      const currentStock = await getProductCurrentStock(product.id)

      if (currentStock < item.quantity) {
        return NextResponse.json({ success: false, error: `Insufficient stock for ${product.name}` }, { status: 400 })
      }

      const subtotal = item.quantity * item.unitPrice
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal,
      })
      total += subtotal
    }

    // Get the next order number
    const year = new Date().getFullYear()
    const orderCount = await prisma.salesOrder.count({
      where: {
        orderNumber: {
          startsWith: `SO-${year}-`,
        },
      },
    })
    const orderNumber = `SO-${year}-${String(orderCount + 1).padStart(4, "0")}`

    // Create order with items
    const newOrder = await prisma.salesOrder.create({
      data: {
        orderNumber,
        customerId,
        status: "PENDING",
        total,
        notes: notes || null,
        orderDate: new Date(),
        createdBy: null, // Would be set from auth context
        items: {
          create: orderItems,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newOrder,
          total: Number(newOrder.total),
          items: newOrder.items.map((item) => ({
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
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}
