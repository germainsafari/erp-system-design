import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { loginSchema } from "@/lib/validators"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.errors },
        { status: 400 },
      )
    }

    const { email, password } = validation.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    if (!user.active) {
      return NextResponse.json({ success: false, error: "Account is inactive" }, { status: 401 })
    }

    // Verify password
    try {
      const isValid = await bcrypt.compare(password, user.passwordHash)
      if (!isValid) {
        console.log("Password comparison failed for user:", email)
        return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
      }
    } catch (bcryptError) {
      console.error("Bcrypt error:", bcryptError)
      return NextResponse.json({ success: false, error: "Password verification failed" }, { status: 500 })
    }

    // Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json({ success: false, error: "Failed to login" }, { status: 500 })
  }
}

