import { NextResponse } from "next/server"
import { seedDatabase } from "@/prisma/seed"

// Force Node runtime and disable static optimization
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * POST /api/db/seed
 * Seeds the database with initial data
 * Protected by SEED_SECRET environment variable
 * 
 * Usage:
 * curl -X POST https://your-domain.com/api/db/seed \
 *   -H "Authorization: Bearer YOUR_SEED_SECRET"
 */
export async function POST(request: Request) {
  try {
    // Check for authorization header with seed secret
    const authHeader = request.headers.get("authorization")
    const seedSecret = process.env.SEED_SECRET || "change-this-in-production"
    const expectedAuth = `Bearer ${seedSecret}`

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Unauthorized. Provide Authorization header with Bearer token.",
          hint: "Set SEED_SECRET environment variable and use: Authorization: Bearer <SEED_SECRET>"
        },
        { status: 401 }
      )
    }

    console.log("🌱 Starting database seed via API...")
    const result = await seedDatabase()

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: result,
    })
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to seed database", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

