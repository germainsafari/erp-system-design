import { NextResponse } from "next/server"
import { prisma, generateId } from "@/lib/db"
import { createEmployeeSchema } from "@/lib/validators"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const where: any = {}

    if (department && department !== "all") {
      where.department = department
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedEmployees = employees.map((emp) => ({
      ...emp,
      salary: emp.salary ? Number(emp.salary) : null,
    }))

    return NextResponse.json({
      success: true,
      data: formattedEmployees,
      total: formattedEmployees.length,
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = createEmployeeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    // Check for duplicate email
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: validation.data.email },
    })

    if (existingEmployee) {
      return NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 })
    }

    const newEmployee = await prisma.employee.create({
      data: {
        firstName: validation.data.firstName,
        lastName: validation.data.lastName,
        email: validation.data.email,
        phone: validation.data.phone || null,
        department: validation.data.department,
        position: validation.data.position,
        hireDate: new Date(validation.data.hireDate),
        salary: validation.data.salary || null,
        status: validation.data.status || "ACTIVE",
        userId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          ...newEmployee,
          salary: newEmployee.salary ? Number(newEmployee.salary) : null,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ success: false, error: "Failed to create employee" }, { status: 500 })
  }
}
