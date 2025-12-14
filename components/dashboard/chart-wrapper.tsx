"use client"

import { useEffect, useState, ReactNode } from "react"

interface ChartWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper component to ensure charts only render on the client side
 * This prevents React 19 hydration issues with Recharts
 */
export function ChartWrapper({ children, fallback }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return fallback || (
      <div className="border rounded-lg p-6 bg-card">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

