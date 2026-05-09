import type { CategoryColor } from "@/features/categories/types/category"

export const categoryColors: CategoryColor[] = [
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
]

export const categoryColorStyles: Record<
  CategoryColor,
  {
    dot: string
    badge: string
    bar: string
    icon: string
  }
> = {
  gray: {
    dot: "bg-slate-500",
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/20",
    bar: "bg-slate-500",
    icon: "text-slate-500",
  },
  red: {
    dot: "bg-red-500",
    badge: "bg-red-500/15 text-red-300 border-red-500/20",
    bar: "bg-red-500",
    icon: "text-red-500",
  },
  orange: {
    dot: "bg-orange-500",
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    bar: "bg-orange-500",
    icon: "text-orange-500",
  },
  yellow: {
    dot: "bg-yellow-500",
    badge: "bg-yellow-500/15 text-yellow-300 border-yellow-500/20",
    bar: "bg-yellow-500",
    icon: "text-yellow-500",
  },
  green: {
    dot: "bg-green-500",
    badge: "bg-green-500/15 text-green-300 border-green-500/20",
    bar: "bg-green-500",
    icon: "text-green-500",
  },
  blue: {
    dot: "bg-blue-500",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    bar: "bg-blue-500",
    icon: "text-blue-500",
  },
  purple: {
    dot: "bg-purple-500",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    bar: "bg-purple-500",
    icon: "text-purple-500",
  },
  pink: {
    dot: "bg-pink-500",
    badge: "bg-pink-500/15 text-pink-300 border-pink-500/20",
    bar: "bg-pink-500",
    icon: "text-pink-500",
  },
}