import { NextResponse } from "next/server"
import { prisma, generateId } from "@/lib/db"
import { createTransactionSchema } from "@/lib/validators"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = {}

    if (type && type !== "all") {
      where.type = type
    }

    if (category && category !== "all") {
      where.category = category
    }

    if (search) {
      where.OR = [
        { category: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
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
      orderBy: { date: "desc" },
    })

    const formattedTransactions = transactions.map((txn) => ({
      ...txn,
      amount: Number(txn.amount),
    }))

    // Calculate totals
    const totalIncome = formattedTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = formattedTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0)

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      total: formattedTransactions.length,
      summary: {
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = createTransactionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    const newTransaction = await prisma.transaction.create({
      data: {
        type: validation.data.type,
        amount: validation.data.amount,
        category: validation.data.category,
        description: validation.data.description || null,
        orderId: null,
        createdBy: null, // Would be set from auth context
        date: validation.data.date ? new Date(validation.data.date) : new Date(),
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
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

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newTransaction,
          amount: Number(newTransaction.amount),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ success: false, error: "Failed to create transaction" }, { status: 500 })
  }
}
