import { NextResponse } from "next/server"
import { getOpenAIClient, DEFAULT_MODEL, DEFAULT_TEMPERATURE } from "@/lib/ai/client"
import { buildSystemPrompt } from "@/lib/ai/prompts"
import { buildOperationalContext } from "@/lib/ai/retrieval"
import type { Role } from "@/lib/types"

// Force dynamic rendering - this route should never be statically generated
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type ChatRole = "user" | "assistant" | "system"
interface ChatMessage {
  role: ChatRole
  content: string
}

interface ChatRequestBody {
  messages?: ChatMessage[]
  includeContext?: boolean
  user?: {
    id?: string
    email?: string
    name?: string
    role?: Role
  }
}

function sanitizeMessages(raw?: ChatMessage[]): ChatMessage[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((msg) => ({
      role: msg?.role === "assistant" ? "assistant" : msg?.role === "system" ? "system" : "user",
      content: typeof msg?.content === "string" ? msg.content.slice(0, 4000) : "",
    }))
    .filter((msg) => msg.content.trim().length > 0)
}

export async function POST(request: Request) {
  try {
    // Check for API key during runtime (not build time)
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment." },
        { status: 500 }
      )
    }

    const body = (await request.json()) as ChatRequestBody
    const messages = sanitizeMessages(body.messages)

    if (!messages.length) {
      return NextResponse.json({ success: false, error: "messages are required" }, { status: 400 })
    }

    const includeContext = body.includeContext !== false
    const userRole = body.user?.role
    const [context] = await Promise.all([includeContext ? buildOperationalContext(userRole) : null])

    const openaiMessages: ChatMessage[] = [
      { role: "system", content: buildSystemPrompt(userRole) },
      context
        ? {
            role: "system",
            content: [context.stats, context.lowStock, context.pendingOrders].join("\n"),
          }
        : null,
      ...messages,
    ].filter(Boolean) as ChatMessage[]

    const client = getOpenAIClient()

    const completion = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: openaiMessages,
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: 500,
    })

    const reply = completion.choices[0]?.message?.content?.trim() || "I could not generate a response."

    return NextResponse.json({
      success: true,
      data: {
        reply,
        context,
      },
    })
  } catch (error) {
    console.error("AI chat error:", error)
    const errorMessage = error instanceof Error ? error.message : "AI chat failed"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

