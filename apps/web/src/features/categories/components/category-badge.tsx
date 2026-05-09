import { FolderIcon } from "lucide-react"

import type { Category } from "@/features/categories/types/category"
import { categoryColorStyles } from "@/features/categories/utils/category-colors"

import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

interface CategoryBadgeProps {
  category?: Category | null
  fallbackLabel: string
  className?: string
}

export function CategoryBadge({
  category,
  fallbackLabel,
  className,
}: CategoryBadgeProps) {
  const color = category?.color ?? "gray"

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0 text-[11px]",
        category
          ? categoryColorStyles[color].badge
          : "border-slate-500/20 bg-slate-500/10 text-slate-300",
        className,
      )}
    >
      <FolderIcon
        className={cn(
          "size-3",
          category
            ? categoryColorStyles[color].icon
            : "text-slate-500",
        )}
      />

      {category?.name ?? fallbackLabel}
    </Badge>
  )
}