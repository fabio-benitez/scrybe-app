import type { LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/shared/components/ui/card"

interface DashboardStatCardProps {
  title: string
  value: string | number
  description: string
  icon: LucideIcon
}

export function DashboardStatCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardStatCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-5 text-primary" />
          </div>

          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
        </div>

        <div className="pl-13">
          <p className="text-3xl font-semibold tracking-tight">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}