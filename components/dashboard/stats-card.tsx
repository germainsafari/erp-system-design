import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
}: StatsCardProps) {
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs">
                {isPositive && (
                  <>
                    <TrendingUp className="w-3 h-3 text-success" />
                    <span className="text-success">+{change}%</span>
                  </>
                )}
                {isNegative && (
                  <>
                    <TrendingDown className="w-3 h-3 text-destructive" />
                    <span className="text-destructive">{change}%</span>
                  </>
                )}
                {changeLabel && <span className="text-muted-foreground ml-1">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-lg bg-muted/50", iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
