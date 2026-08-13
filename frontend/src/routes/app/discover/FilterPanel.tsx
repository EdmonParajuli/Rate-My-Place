import { X } from "lucide-react"
import type { DiscoverFilters, DiscoverPriceRange } from "./filterTypes"

const PRICES: DiscoverPriceRange[] = ["LOW", "MEDIUM", "HIGH"]
const PRICE_LABEL: Record<DiscoverPriceRange, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" }
const RATINGS = [0, 3, 4, 4.5]

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  )
}

// Category/price are single-select (see filterTypes.ts) - clicking the
// already-active pill clears that filter, matching a radio-with-off pattern.
export function FilterPanel({
  categories,
  filters,
  onChange,
  onClearAll,
}: {
  categories: { id: number; label: string }[]
  filters: DiscoverFilters
  onChange: (next: DiscoverFilters) => void
  onClearAll: () => void
}) {
  return (
    <div className="mx-4 mt-4 rounded-2xl border border-border bg-card px-6 py-4 md:mx-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold">Filters</h3>
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-100"
        >
          <X className="h-3.5 w-3.5" />
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-slate-700 uppercase">Category</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <Pill
                key={category.id}
                active={filters.categoryId === category.id}
                onClick={() => onChange({ ...filters, categoryId: filters.categoryId === category.id ? null : category.id })}
              >
                {category.label}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-slate-700 uppercase">Price Range</p>
          <div className="flex gap-1.5">
            {PRICES.map((price) => (
              <Pill
                key={price}
                active={filters.priceRange === price}
                onClick={() => onChange({ ...filters, priceRange: filters.priceRange === price ? null : price })}
              >
                {PRICE_LABEL[price]}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold tracking-wide text-slate-700 uppercase">Min Rating</p>
          <div className="flex gap-1.5">
            {RATINGS.map((rating) => (
              <Pill key={rating} active={filters.minRating === rating} onClick={() => onChange({ ...filters, minRating: rating })}>
                {rating === 0 ? "Any" : `${rating}+★`}
              </Pill>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <Pill active={filters.openNow} onClick={() => onChange({ ...filters, openNow: !filters.openNow })}>
            Open Now
          </Pill>
        </div>
      </div>
    </div>
  )
}
