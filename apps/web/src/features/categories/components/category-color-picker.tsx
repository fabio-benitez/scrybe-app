import { useTranslation } from "react-i18next"

import type { CategoryColor } from "@/features/categories/types/category"
import {
  categoryColorStyles,
  categoryColors,
} from "@/features/categories/utils/category-colors"

import {
  RadioGroup,
  RadioGroupItem,
} from "@/shared/components/ui/radio-group"
import { cn } from "@/shared/lib/utils"

interface CategoryColorPickerProps {
  value: CategoryColor
  onValueChange: (value: CategoryColor) => void
}

export function CategoryColorPicker({
  value,
  onValueChange,
}: CategoryColorPickerProps) {
  const { t } = useTranslation()

  return (
    <RadioGroup
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as CategoryColor)}
      className="flex flex-wrap gap-3"
    >
      {categoryColors.map((color) => (
        <label
          key={color}
          className="group relative flex cursor-pointer items-center justify-center"
          title={t(`categories.colors.${color}`)}
        >
          <RadioGroupItem value={color} className="sr-only" />

          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-full border border-border/70 transition-all group-hover:scale-105",
              value === color && "ring-2 ring-ring ring-offset-2 ring-offset-background",
            )}
          >
            <span
              className={cn(
                "size-5 rounded-full",
                categoryColorStyles[color].dot,
              )}
            />
          </span>

          <span className="sr-only">
            {t(`categories.colors.${color}`)}
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}