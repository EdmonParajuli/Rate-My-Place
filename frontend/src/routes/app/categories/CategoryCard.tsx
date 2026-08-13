import { Link } from "react-router-dom"
import { ChevronRight, Star } from "lucide-react"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import { getCategoryIcon } from "@/lib/categoryIcons"
import type { CategorySummary } from "./types"

// coverImageUrl is real but unseeded today (docs/03-architecture.md notes
// this explicitly) - the gradient (real per-category accent colors, not a
// gray placeholder) carries the card either way; a photo would layer
// underneath it the moment coverImageUrl actually gets populated, no code
// change needed then.
export function CategoryCard({ category }: { category: CategorySummary }) {
  const style = category.label ? CATEGORY_STYLES[category.label] : undefined
  const Icon = getCategoryIcon(category.icon)

  return (
    <Link
      to={`/app/categories/${category.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-28 overflow-hidden">
        {category.coverImageUrl && (
          <img
            src={category.coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${style?.gradient ?? "from-slate-400 to-slate-600"} ${category.coverImageUrl ? "opacity-70" : ""}`} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="mb-1 h-8 w-8 text-white" />
          <span className="text-sm font-bold text-white">{category.label}</span>
        </div>
      </div>
      <div className="flex items-center justify-between p-3">
        <div>
          <p className="text-xs font-bold text-slate-700">{(category.businessCount ?? 0).toLocaleString()} businesses</p>
          <div className="mt-0.5 flex items-center gap-1">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs text-muted-foreground">{(category.avgRating ?? 0).toFixed(1)} avg</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  )
}
