import { NextResponse } from "next/server"
import { prisma, generateId } from "@/lib/db"
import { createSupplierSchema } from "@/lib/validators"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const active = searchParams.get("active")

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
      ]
    }

    if (active !== null) {
      where.active = active === "true"
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: suppliers,
      total: suppliers.length,
    })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = createSupplierSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name: validation.data.name,
        contactName: validation.data.contactName || null,
        email: validation.data.email || null,
        phone: validation.data.phone || null,
        address: validation.data.address || null,
        active: validation.data.active ?? true,
      },
    })

    return NextResponse.json({ success: true, data: newSupplier }, { status: 201 })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ success: false, error: "Failed to create supplier" }, { status: 500 })
  }
}
