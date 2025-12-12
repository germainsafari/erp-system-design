import { NextResponse } from "next/server"
import { calculateCustomerHealthScores } from "@/lib/forecasting/customer-health"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const healthData = await calculateCustomerHealthScores()

    return NextResponse.json({
      success: true,
      data: healthData,
    })
  } catch (error) {
    console.error("Error calculating customer health scores:", error)
    return NextResponse.json(
      { success: false, error: "Failed to calculate customer health scores" },
      { status: 500 }
    )
  }
}






