import { useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import type { Category } from "@/features/categories/types/category"
import { categoryColorStyles } from "@/features/categories/utils/category-colors"

import { Button } from "@/shared/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"

interface CategoryComboboxProps {
  value: string
  onValueChange: (value: string) => void
  categories: Category[]
}

export function CategoryCombobox({
  value,
  onValueChange,
  categories,
}: CategoryComboboxProps) {
  const { t } = useTranslation()

  const [open, setOpen] = useState(false)

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === value)
  }, [categories, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <div className="flex min-w-0 items-center gap-2">
            {selectedCategory ? (
              <>
                <span
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    categoryColorStyles[
                      selectedCategory.color ?? "gray"
                    ].dot,
                  )}
                />

                <span className="truncate">
                  {selectedCategory.name}
                </span>
              </>
            ) : (
              <span className="truncate text-muted-foreground">
                {t("notes.uncategorized")}
              </span>
            )}
          </div>

          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command>
          <CommandInput
            placeholder={t("categories.search.placeholder")}
          />

          <CommandList>
            <CommandEmpty>
              {t("categories.search.empty")}
            </CommandEmpty>

            <CommandGroup>
              <CommandItem
                value="uncategorized"
                onSelect={() => {
                  onValueChange("uncategorized")
                  setOpen(false)
                }}
              >
                <CheckIcon
                  className={cn(
                    "mr-2 size-4",
                    value === "uncategorized"
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />

                {t("notes.uncategorized")}
              </CommandItem>

              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onValueChange(category.id)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === category.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />

                  <span
                    className={cn(
                      "mr-2 size-2.5 rounded-full",
                      categoryColorStyles[
                        category.color ?? "gray"
                      ].dot,
                    )}
                  />

                  <span className="truncate">
                    {category.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}