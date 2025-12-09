import { NextResponse } from "next/server"
import { prisma, generateId } from "@/lib/db"
import { createCustomerSchema } from "@/lib/validators"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: customers,
      total: customers.length,
    })
  } catch (error) {
    console.error("Error fetching customers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = createCustomerSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    const newCustomer = await prisma.customer.create({
      data: {
        name: validation.data.name,
        email: validation.data.email || null,
        phone: validation.data.phone || null,
        address: validation.data.address || null,
      },
    })

    return NextResponse.json({ success: true, data: newCustomer }, { status: 201 })
  } catch (error) {
    console.error("Error creating customer:", error)
    return NextResponse.json({ success: false, error: "Failed to create customer" }, { status: 500 })
  }
}
