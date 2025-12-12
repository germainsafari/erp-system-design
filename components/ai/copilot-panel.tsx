"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Sparkles, Send, Loader2, Shield, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth"
import type React from "react"

type ChatRole = "user" | "assistant"

interface ChatMessage {
  role: ChatRole
  content: string
}

const starterPrompts = [
  "Summarize today’s key risks and opportunities.",
  "Which products are low on stock and need reordering?",
  "Give me talking points for the latest pending orders.",
  "What should I prioritize in operations today?",
]

export function CopilotPanel() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I can answer questions about orders, inventory, and finances." },
  ])
  const [draft, setDraft] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPrompts, setShowPrompts] = useState(true)
  const viewportRef = useRef<HTMLDivElement>(null)

  const roleLabel = useMemo(() => user?.role ?? "Unknown role", [user?.role])

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  // Reset prompts when sheet closes
  useEffect(() => {
    if (!open) {
      setShowPrompts(true)
    }
  }, [open])

  const sendMessage = async (prompt?: string) => {
    const content = prompt ?? draft.trim()
    if (!content) return

    // Hide prompts when user sends a message
    if (prompt) {
      setShowPrompts(false)
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }]
    setMessages(nextMessages)
    setDraft("")
    setError(null)
    setIsThinking(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          user: user
            ? { id: user.id, email: user.email, name: user.name, role: user.role }
            : undefined,
          includeContext: true,
        }),
      })

      const json = await response.json()
      if (!json?.success) {
        throw new Error(json?.error || "AI request failed")
      }

      const reply = json.data?.reply ?? "No response generated."
      setMessages([...nextMessages, { role: "assistant", content: reply }])
    } catch (err) {
      console.error("Copilot error:", err)
      setError("Unable to generate a response. Please try again.")
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary to-primary/80 text-white"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open AI Copilot</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="fixed inset-auto right-4 bottom-4 sm:right-6 sm:bottom-6 w-[94vw] sm:w-[400px] sm:max-w-[400px] h-[85vh] max-h-[90vh] sm:h-[85vh] sm:max-h-[90vh] rounded-2xl border shadow-2xl p-0 flex flex-col overflow-hidden bg-background"
      >
        <SheetHeader className="p-4 pb-2 flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Copilot
            <Badge variant="outline">{roleLabel}</Badge>
          </SheetTitle>
          <SheetDescription>
            Ask about orders, inventory, suppliers, or finances. Responses include live stats context.
          </SheetDescription>
          {showPrompts && (
            <div className="flex flex-wrap gap-2 pt-2 transition-opacity duration-200">
              {starterPrompts.map((prompt) => (
                <Button key={prompt} variant="secondary" size="sm" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </Button>
              ))}
            </div>
          )}
        </SheetHeader>

        {showPrompts && <Separator className="flex-shrink-0" />}

        <div className="flex-1 min-h-0 flex flex-col gap-4 p-4 overflow-hidden">
          <div
            ref={viewportRef}
            className="flex-1 min-h-0 overflow-y-auto rounded-md border border-border bg-muted/30 p-3 sm:p-4"
            style={{ scrollbarWidth: "thin" }}
          >
            <div className="flex flex-col gap-3">
              {messages.map((message, idx) => (
                <div
                  key={`${message.role}-${idx}`}
                  className={`flex flex-col gap-1 rounded-md border border-border/60 bg-background p-3 ${
                    message.role === "assistant" ? "shadow-sm" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {message.role === "assistant" ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> Copilot
                      </>
                    ) : (
                      <>
                        <Shield className="h-3.5 w-3.5" /> You
                      </>
                    )}
                  </div>
                  <div className="text-sm leading-relaxed text-foreground space-y-2">
                    {renderStructuredContent(message.content)}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0 mt-auto">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask anything about your ERP data..."
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <div className="flex justify-end">
              <Button onClick={() => sendMessage()} disabled={isThinking || !draft.trim()} className="gap-2">
                {isThinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function renderStructuredContent(content: string): React.ReactNode[] {
  const lines = content.split(/\r?\n/).map((line) => line.trimEnd())
  const nodes: React.ReactNode[] = []
  let bullets: string[] = []

  const flushBullets = () => {
    if (!bullets.length) return
    nodes.push(
      <ul className="list-disc pl-5 space-y-1" key={`bullets-${nodes.length}`}>
        {bullets.map((text, idx) => (
          <li key={`b-${idx}`} className="text-sm text-foreground">
            {renderInline(text)}
          </li>
        ))}
      </ul>,
    )
    bullets = []
  }

  lines.forEach((line, idx) => {
    if (!line.trim()) {
      flushBullets()
      return
    }

    const headingMatch = line.match(/^#{1,6}\s*(.+)/)
    if (headingMatch) {
      flushBullets()
      nodes.push(
        <p key={`h-${idx}`} className="font-semibold text-foreground">
          {renderInline(headingMatch[1])}
        </p>,
      )
      return
    }

    const bulletMatch = line.match(/^[-*]\s+(.+)/)
    if (bulletMatch) {
      bullets.push(bulletMatch[1])
      return
    }

    flushBullets()
    nodes.push(
      <p key={`p-${idx}`} className="text-foreground">
        {renderInline(line)}
      </p>,
    )
  })

  flushBullets()
  return nodes
}

function renderInline(text: string): React.ReactNode {
  // Minimal inline bold parser for **bold**
  const parts = text.split("**")
  if (parts.length === 1) return text

  return parts.map((part, idx) =>
    idx % 2 === 1 ? (
      <strong key={`bold-${idx}`} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={`txt-${idx}`}>{part}</span>
    ),
  )
}

