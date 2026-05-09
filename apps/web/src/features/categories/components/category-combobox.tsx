import { useMemo, useState } from "react"
import { CheckIcon, ChevronsUpDownIcon, FolderIcon } from "lucide-react"
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
  allLabel?: string
  allValue?: string
}

export function CategoryCombobox({
  value,
  onValueChange,
  categories,
  allLabel,
  allValue = "all",
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
                <FolderIcon
                  className={cn(
                    "size-4 shrink-0",
                    categoryColorStyles[
                      selectedCategory.color ?? "gray"
                    ].icon,
                  )}
                />

                <span className="truncate">
                  {selectedCategory.name}
                </span>
              </>
            ) : (
              <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <FolderIcon className="size-4 shrink-0 text-slate-500" />

                <span className="truncate">
                  {value === allValue && allLabel
                    ? allLabel
                    : t("notes.uncategorized")}
                </span>
              </div>
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
              {allLabel && (
                <CommandItem
                  value={allLabel}
                  onSelect={() => {
                    onValueChange(allValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === allValue ? "opacity-100" : "opacity-0",
                    )}
                  />

                  {allLabel}
                </CommandItem>
              )}

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

                <FolderIcon className="mr-2 size-4 shrink-0 text-slate-500" />

                <span className="truncate">
                  {t("notes.uncategorized")}
                </span>
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

                  <FolderIcon
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      categoryColorStyles[
                        category.color ?? "gray"
                      ].icon,
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