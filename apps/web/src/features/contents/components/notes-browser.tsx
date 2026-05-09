import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  FileTextIcon,
  LayoutGridIcon,
  ListIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"

import { CategoryBadge } from "@/features/categories/components/category-badge"
import { CategoryCombobox } from "@/features/categories/components/category-combobox"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { categoryColorStyles } from "@/features/categories/utils/category-colors"
import { NoteActions } from "@/features/contents/components/note-actions"
import { NoteCard } from "@/features/contents/components/note-card"
import type { Content } from "@/features/contents/types/content"
import { extractTextFromTipTap } from "@/features/contents/utils/content-text"

import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination"
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group"
import { formatRelativeDate } from "@/shared/lib/date"
import { cn } from "@/shared/lib/utils"
import {
  getNotesView,
  setNotesView,
  type NotesViewMode,
} from "@/shared/preferences/preferences"

const GRID_ITEMS_PER_PAGE = 12
const LIST_ITEMS_PER_PAGE = 8

type NotesSort = "recent" | "oldest"

interface NotesBrowserProps {
  title: string
  description: string
  contents: Content[]
  isLoading?: boolean
}

export function NotesBrowser({
  title,
  description,
  contents,
  isLoading = false,
}: NotesBrowserProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sort, setSort] = useState<NotesSort>("recent")
  const [page, setPage] = useState(1)
  const [viewMode, setViewModeState] = useState<NotesViewMode>("list")

  const itemsPerPage =
    viewMode === "grid" ? GRID_ITEMS_PER_PAGE : LIST_ITEMS_PER_PAGE

  const { data: categories } = useCategories()

  useEffect(() => {
    setViewModeState(getNotesView())
  }, [])

  const allContents = contents
  const allCategories = categories ?? []

  const categoriesById = useMemo(() => {
    return new Map(allCategories.map((category) => [category.id, category]))
  }, [allCategories])

  const filteredContents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return allContents
      .filter((content) => {
        if (selectedCategory === "uncategorized") {
          return !content.category_id
        }

        if (selectedCategory !== "all") {
          return content.category_id === selectedCategory
        }

        return true
      })
      .filter((content) => {
        if (!normalizedSearch) return true

        const excerpt = extractTextFromTipTap(content.content).toLowerCase()

        return (
          content.title.toLowerCase().includes(normalizedSearch) ||
          content.summary?.toLowerCase().includes(normalizedSearch) ||
          excerpt.includes(normalizedSearch)
        )
      })
      .sort((a, b) => {
        const dateA = new Date(a.updated_at).getTime()
        const dateB = new Date(b.updated_at).getTime()

        return sort === "recent" ? dateB - dateA : dateA - dateB
      })
  }, [allContents, search, selectedCategory, sort])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredContents.length / itemsPerPage),
  )

  const paginatedContents = filteredContents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  )

  const from =
    filteredContents.length === 0 ? 0 : (page - 1) * itemsPerPage + 1

  const to = Math.min(page * itemsPerPage, filteredContents.length)

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleCategoryChange(value: string) {
    setSelectedCategory(value)
    setPage(1)
  }

  function handleSortChange(value: NotesSort) {
    setSort(value)
    setPage(1)
  }

  function handleViewModeChange(value: string) {
    if (value !== "list" && value !== "grid") return

    setNotesView(value)
    setViewModeState(value)
    setPage(1)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {title}
          </h1>

          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <Button className="w-fit" asChild>
          <Link to="/app/notes/new">
            <PlusIcon className="size-4" />
            {t("notes.new")}
          </Link>
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">
          {t("notes.loading")}
        </p>
      )}

      {!isLoading && allContents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <h2 className="text-lg font-medium">
              {title}
            </h2>

            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && allContents.length > 0 && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-80">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(event.target.value)
                  }
                  placeholder={t("notes.search.placeholder")}
                  className="pl-9"
                />
              </div>

              <div className="w-full md:w-64">
                <CategoryCombobox
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                  categories={allCategories}
                  allLabel={t("notes.filters.allCategories")}
                  allValue="all"
                />
              </div>

              <Select
                value={sort}
                onValueChange={(value) =>
                  handleSortChange(value as NotesSort)
                }
              >
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent position="popper">
                  <SelectItem value="recent">
                    {t("notes.filters.recent")}
                  </SelectItem>
                  <SelectItem value="oldest">
                    {t("notes.filters.oldest")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={handleViewModeChange}
              className="justify-start rounded-md border bg-background p-1"
            >
              <ToggleGroupItem
                value="list"
                aria-label={t("notes.view.list")}
                className="h-8 px-3"
              >
                <ListIcon className="size-4" />
              </ToggleGroupItem>

              <ToggleGroupItem
                value="grid"
                aria-label={t("notes.view.grid")}
                className="h-8 px-3"
              >
                <LayoutGridIcon className="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {filteredContents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {t("notes.search.empty")}
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {paginatedContents.map((content) => {
                const category = content.category_id
                  ? categoriesById.get(content.category_id)
                  : null

                return (
                  <NoteCard
                    key={content.id}
                    content={content}
                    color={category?.color}
                    category={category}
                  />
                )
              })}
            </div>
          ) : (
            <Card className="overflow-hidden p-0">
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">
                      {t("notes.table.note")}
                    </TableHead>
                    <TableHead className="w-56">
                      {t("notes.table.category")}
                    </TableHead>
                    <TableHead className="w-52">
                      {t("notes.table.updatedAt")}
                    </TableHead>
                    <TableHead className="w-36 pr-6 text-center">
                      {t("notes.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedContents.map((content) => {
                    const category = content.category_id
                      ? categoriesById.get(content.category_id)
                      : null
                    const excerpt = extractTextFromTipTap(content.content)

                    return (
                      <TableRow
                        key={content.id}
                        className="h-16 cursor-pointer"
                        onClick={() =>
                          navigate(`/app/notes/${content.id}`, {
                            state: { breadcrumbLabel: content.title },
                          })
                        }
                      >
                        <TableCell className="pl-6">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <FileTextIcon
                                className={cn(
                                  "size-4 shrink-0",
                                  category
                                    ? categoryColorStyles[
                                      category.color ?? "gray"
                                    ].icon
                                    : "text-muted-foreground",
                                )}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {content.title}
                              </p>

                              {excerpt && (
                                <p className="line-clamp-1 text-xs text-muted-foreground">
                                  {excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <CategoryBadge
                            category={category}
                            fallbackLabel={t("notes.uncategorized")}
                          />
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {formatRelativeDate(
                            content.updated_at,
                            i18n.language,
                            t,
                          )}
                        </TableCell>

                        <TableCell className="pr-6">
                          <div
                            className="flex justify-center"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <NoteActions content={content} />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              {t("notes.pagination.summary", {
                from,
                to,
                total: filteredContents.length,
              })}
            </p>

            <Pagination className="mx-0 w-auto justify-start md:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text={t("notes.pagination.previous")}
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
                    text={t("notes.pagination.next")}
                    aria-disabled={page === totalPages}
                    className={cn(
                      page === totalPages &&
                      "pointer-events-none opacity-50",
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
        </>
      )}
    </div>
  )
}