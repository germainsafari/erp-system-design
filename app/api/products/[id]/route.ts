import { NextResponse } from "next/server"
import { prisma, getProductCurrentStock } from "@/lib/db"
import { updateProductSchema } from "@/lib/validators"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    const currentStock = await getProductCurrentStock(product.id)

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        price: Number(product.price),
        cost: Number(product.cost),
        currentStock,
      },
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validation = updateProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Check for duplicate SKU (excluding current product)
    if (validation.data.sku) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          sku: validation.data.sku,
          id: { not: id },
        },
      })

      if (duplicateProduct) {
        return NextResponse.json({ success: false, error: "SKU already exists" }, { status: 400 })
      }
    }

    const updateData: any = {}
    if (validation.data.sku) updateData.sku = validation.data.sku
    if (validation.data.name) updateData.name = validation.data.name
    if (validation.data.description !== undefined) updateData.description = validation.data.description
    if (validation.data.price !== undefined) updateData.price = validation.data.price
    if (validation.data.cost !== undefined) updateData.cost = validation.data.cost
    if (validation.data.category) updateData.category = validation.data.category
    if (validation.data.minStock !== undefined) updateData.minStock = validation.data.minStock
    if (validation.data.active !== undefined) updateData.active = validation.data.active

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    })

    const currentStock = await getProductCurrentStock(updatedProduct.id)

    return NextResponse.json({
      success: true,
      data: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        cost: Number(updatedProduct.cost),
        currentStock,
      },
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    // Soft delete - mark as inactive
    await prisma.product.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ success: true, message: "Product deactivated" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, error: "Failed to delete product" }, { status: 500 })
  }
}
