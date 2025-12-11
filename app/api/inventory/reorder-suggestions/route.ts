import { NextResponse } from "next/server"
import { generateReorderSuggestions } from "@/lib/forecasting/intelligent-reordering"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const suggestions = await generateReorderSuggestions()

    return NextResponse.json({
      success: true,
      data: suggestions,
    })
  } catch (error) {
    console.error("Error generating reorder suggestions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate reorder suggestions" },
      { status: 500 }
    )
  }
}





