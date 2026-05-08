import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination"

import { CategoryFormDialog } from "@/features/categories/components/category-form-dialog"
import { DeleteCategoryDialog } from "@/features/categories/components/delete-category-dialog"
import { useCategories } from "@/features/categories/hooks/use-categories"
import type { Category } from "@/features/categories/types/category"
import { categoryColorDotClass } from "@/features/categories/utils/category-colors"
import { useContents } from "@/features/contents/hooks/use-contents"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { formatRelativeDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/utils"

const ITEMS_PER_PAGE = 8

type CategorySort = "name-asc" | "notes-desc" | "updated-desc"

interface CategoryWithStats extends Category {
  notesCount: number
}

export default function CategoriesPage() {
  const { t, i18n } = useTranslation()
  const { data: categories, isLoading: isCategoriesLoading } = useCategories()
  const { data: contents, isLoading: isContentsLoading } = useContents()

  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<CategorySort>("name-asc")
  const [page, setPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithStats | undefined>()

  const isLoading = isCategoriesLoading || isContentsLoading

  const categoriesWithStats = useMemo<CategoryWithStats[]>(() => {
    return (categories ?? []).map((category) => ({
      ...category,
      notesCount:
        contents?.filter((content) => content.category_id === category.id)
          .length ?? 0,
    }))
  }, [categories, contents])

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    const filtered = categoriesWithStats.filter((category) => {
      if (!normalizedSearch) return true

      return (
        category.name.toLowerCase().includes(normalizedSearch) ||
        category.description?.toLowerCase().includes(normalizedSearch)
      )
    })

    return [...filtered].sort((a, b) => {
      if (sort === "notes-desc") {
        return b.notesCount - a.notesCount
      }

      if (sort === "updated-desc") {
        return (
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
        )
      }

      return a.name.localeCompare(b.name, i18n.language, {
        sensitivity: "base",
      })
    })
  }, [categoriesWithStats, i18n.language, search, sort])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCategories.length / ITEMS_PER_PAGE),
  )

  const paginatedCategories = filteredCategories.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleSortChange(value: CategorySort) {
    setSort(value)
    setPage(1)
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {t("categories.title")}
            </h1>

            <p className="text-sm text-muted-foreground">
              {t("categories.description")}
            </p>
          </div>

          <Button
            className="w-fit"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusIcon className="size-4" />
            {t("categories.new")}
          </Button>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground">
            {t("categories.loading")}
          </p>
        )}

        {!isLoading && categories?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <h2 className="text-lg font-medium">
                {t("categories.empty.title")}
              </h2>

              <p className="text-sm text-muted-foreground">
                {t("categories.empty.description")}
              </p>

              <Button
                className="mt-4"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <PlusIcon className="size-4" />
                {t("categories.new")}
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && categories && categories.length > 0 && (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder={t("categories.search.placeholder")}
                  className="pl-9"
                />
              </div>

              <Select value={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="name-asc">
                    {t("categories.sort.nameAsc")}
                  </SelectItem>
                  <SelectItem value="notes-desc">
                    {t("categories.sort.notesDesc")}
                  </SelectItem>
                  <SelectItem value="updated-desc">
                    {t("categories.sort.updatedDesc")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="overflow-hidden p-0">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-10">
                      {t("categories.table.category")}
                    </TableHead>
                    <TableHead className="">
                      {t("categories.table.description")}
                    </TableHead>
                    <TableHead className="text-center">
                      {t("categories.table.notes")}
                    </TableHead>
                    <TableHead className="">
                      {t("categories.table.updatedAt")}
                    </TableHead>
                    <TableHead className="pr-10 text-center">
                      {t("categories.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedCategories.map((category) => (
                    <TableRow key={category.id} className="h-16">
                      <TableCell className="pl-10">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={cn(
                              "size-3.5 shrink-0 rounded-full",
                              categoryColorDotClass[category.color ?? "gray"],
                            )}
                          />

                          <span className="truncate font-medium">
                            {category.name}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        <span className="line-clamp-1">
                          {category.description ||
                            t("categories.table.noDescription")}
                        </span>
                      </TableCell>

                      <TableCell className="text-center text-muted-foreground">
                        {category.notesCount}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatRelativeDate(
                          category.updated_at,
                          i18n.language,
                          t,
                        )}
                      </TableCell>

                      <TableCell className="pr-10">
                        <div className="flex justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-9"
                            aria-label={t("categories.actions.edit")}
                            onClick={() => setEditingCategory(category)}
                          >
                            <PencilIcon className="size-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            className="size-9"
                            aria-label={t("categories.actions.delete")}
                            onClick={() => setDeletingCategory(category)}
                          >
                            <Trash2Icon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredCategories.length === 0 && (
                <div className="border-t py-12 text-center text-sm text-muted-foreground">
                  {t("categories.search.empty")}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("categories.pagination.summary", {
                    total: filteredCategories.length,
                    page,
                    totalPages,
                  })}
                </p>

                <Pagination className="mx-0 w-auto justify-start md:justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        text={t("categories.pagination.previous")}
                        aria-disabled={page === 1}
                        className={cn(
                          page === 1 && "pointer-events-none opacity-50",
                        )}
                        onClick={(event) => {
                          event.preventDefault()

                          if (page === 1) return

                          setPage((currentPage) => currentPage - 1)
                        }}
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        text={t("categories.pagination.next")}
                        aria-disabled={page === totalPages}
                        className={cn(
                          page === totalPages && "pointer-events-none opacity-50",
                        )}
                        onClick={(event) => {
                          event.preventDefault()

                          if (page === totalPages) return

                          setPage((currentPage) => currentPage + 1)
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </Card>
          </>
        )}
      </div>

      <CategoryFormDialog
        mode="create"
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <CategoryFormDialog
        mode="edit"
        open={Boolean(editingCategory)}
        onOpenChange={(open) => {
          if (!open) setEditingCategory(undefined)
        }}
        category={editingCategory}
      />

      <DeleteCategoryDialog
        open={Boolean(deletingCategory)}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(undefined)
        }}
        category={deletingCategory}
        notesCount={deletingCategory?.notesCount ?? 0}
      />
    </>
  )
}