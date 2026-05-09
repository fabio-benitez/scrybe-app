import { PinIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface PinnedIconProps {
  className?: string
}

export function PinnedIcon({ className }: PinnedIconProps) {
  return (
    <PinIcon
      className={cn("rotate-45", className)}
    />
  )
}