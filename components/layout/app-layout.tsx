import type React from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { CopilotPanel } from "../ai/copilot-panel"

interface AppLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function AppLayout({ children, title, description, action }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} description={description} action={action} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
        <CopilotPanel />
      </div>
    </div>
  )
}
