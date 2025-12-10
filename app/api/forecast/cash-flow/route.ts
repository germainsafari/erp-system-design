import { NextResponse } from "next/server"
import { generateCashFlowForecast } from "@/lib/forecasting/cash-flow"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "90", 10)

    if (days < 7 || days > 180) {
      return NextResponse.json(
        { success: false, error: "Days must be between 7 and 180" },
        { status: 400 }
      )
    }

    const forecast = await generateCashFlowForecast(days)

    return NextResponse.json({
      success: true,
      data: forecast,
    })
  } catch (error) {
    console.error("Error generating cash flow forecast:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate cash flow forecast" },
      { status: 500 }
    )
  }
}


