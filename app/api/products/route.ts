import { NextResponse } from "next/server"
import { prisma, generateId, getProductCurrentStock } from "@/lib/db"
import { createProductSchema } from "@/lib/validators"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const active = searchParams.get("active")

    const where: any = {}

    if (category && category !== "all") {
      where.category = category
    }

    if (active !== null) {
      where.active = active === "true"
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    // Calculate current stock for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const currentStock = await getProductCurrentStock(product.id)
        return {
          ...product,
          price: Number(product.price),
          cost: Number(product.cost),
          currentStock,
        }
      }),
    )

    return NextResponse.json({
      success: true,
      data: productsWithStock,
      total: productsWithStock.length,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = createProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    // Check for duplicate SKU
    const existingProduct = await prisma.product.findUnique({
      where: { sku: validation.data.sku },
    })

    if (existingProduct) {
      return NextResponse.json({ success: false, error: "SKU already exists" }, { status: 400 })
    }

    const newProduct = await prisma.product.create({
      data: {
        sku: validation.data.sku,
        name: validation.data.name,
        description: validation.data.description,
        price: validation.data.price,
        cost: validation.data.cost,
        category: validation.data.category,
        minStock: validation.data.minStock || 10,
        active: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newProduct,
          price: Number(newProduct.price),
          cost: Number(newProduct.cost),
          currentStock: 0,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Failed to create product" }, { status: 500 })
  }
}
