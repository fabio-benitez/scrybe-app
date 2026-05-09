import { Link } from "react-router-dom"
import type { ComponentType } from "react"

import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

interface DashboardStatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
  icon: ComponentType<{ className?: string }>
  to?: string
  iconClassName?: string
  iconWrapperClassName?: string
}

export function DashboardStatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  to,
  iconClassName,
  iconWrapperClassName,
}: DashboardStatCardProps) {
  const card = (
    <Card className={cn("h-full transition-colors", to && "hover:bg-muted/40")}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-muted",
              iconWrapperClassName,
            )}
          >
            <Icon className={cn("size-5 text-primary", iconClassName)} />
          </div>

          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
        </div>

        <div className="pl-13">
          <p className="text-3xl font-semibold tracking-tight">{value}</p>

          <div className="mt-1 flex items-center gap-1 text-xs">
            {typeof trend === "number" && (
              <span className="font-medium text-green-500">
                +{trend}
              </span>
            )}

            {description && (
              <span className="text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!to) {
    return card
  }

  return (
    <Link
      to={to}
      className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {card}
    </Link>
  )
}