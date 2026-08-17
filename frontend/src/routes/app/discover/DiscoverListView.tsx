import { Flame, Map, Search, Sparkles, SlidersHorizontal } from "lucide-react"
import { PlaceCard } from "./PlaceCard"
import { PlaceStrip } from "./PlaceStrip"
import { FilterPanel } from "./FilterPanel"
import type { DiscoverFilters } from "./filterTypes"
import type { DiscoverPlace } from "./types"
import type { PlaceSortEnum } from "@/lib/graphql/generated/graphql"

const SORTS: { value: PlaceSortEnum; label: string }[] = [
  { value: "HIGHEST_RATED", label: "Highest Rated" },
  { value: "TRENDING", label: "Trending" },
  { value: "NEW", label: "New" },
  { value: "NEAREST", label: "Nearby" },
]

export function DiscoverListView({
  places,
  loading,
  hasNextPage,
  loadingMore,
  onLoadMore,
  sort,
  onSortChange,
  filters,
  onFiltersChange,
  filterPanelOpen,
  onToggleFilterPanel,
  categories,
  geolocationError,
  trendingPlaces,
  newPlaces,
  onShowMap,
}: {
  places: DiscoverPlace[]
  loading: boolean
  hasNextPage: boolean
  loadingMore: boolean
  onLoadMore: () => void
  sort: PlaceSortEnum
  onSortChange: (sort: PlaceSortEnum) => void
  filters: DiscoverFilters
  onFiltersChange: (filters: DiscoverFilters) => void
  filterPanelOpen: boolean
  onToggleFilterPanel: () => void
  categories: { id: number; label: string }[]
  geolocationError: string | null
  trendingPlaces: DiscoverPlace[]
  newPlaces: DiscoverPlace[]
  onShowMap: () => void
}) {
  const isFiltered = Boolean(filters.query || filters.categoryId || filters.priceRange || filters.openNow || filters.minRating)
  const activeFilterCount = [filters.categoryId, filters.priceRange, filters.openNow || null, filters.minRating || null].filter(
    Boolean
  ).length

  return (
    <div>
      <div className="m-4 mb-0 rounded-3xl bg-gradient-to-r from-blue-950 to-slate-900 px-6 py-8 md:m-6 md:mb-0">
        <p className="mb-2 text-xs font-semibold tracking-wider text-blue-200 uppercase">Explore your city</p>
        <h2 className="mb-4 text-2xl font-extrabold text-white">Find places near you</h2>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-4 shadow-lg">
            <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
            <input
              value={filters.query}
              onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
              placeholder="Search places, categories..."
              className="flex-1 bg-transparent py-3 text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleFilterPanel}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => onSortChange(s.value)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  sort === s.value
                    ? "border-white bg-white text-primary"
                    : "border-white/20 bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        {geolocationError && sort === "NEAREST" && <p className="mt-3 text-xs text-amber-300">{geolocationError}</p>}
      </div>

      {filterPanelOpen && (
        <FilterPanel
          categories={categories}
          filters={filters}
          onChange={onFiltersChange}
          onClearAll={() => onFiltersChange({ query: filters.query, categoryId: null, priceRange: null, minRating: 0, openNow: false })}
        />
      )}

      <div className="space-y-10 p-4 md:p-6">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold">{isFiltered ? `Results (${places.length})` : "All Places"}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Sorted by: {SORTS.find((s) => s.value === sort)?.label}</p>
            </div>
            <button
              type="button"
              onClick={onShowMap}
              className="flex flex-shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Map className="h-4 w-4" /> See in map
            </button>
          </div>

          {loading && places.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading places...</p>
          ) : places.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Search className="h-8 w-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-700">No places found</p>
              <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {places.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
              {hasNextPage && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="cursor-pointer rounded-xl border border-border px-6 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <PlaceStrip icon={<Flame className="h-5 w-5 text-orange-500" />} title="Trending This Week" places={trendingPlaces} />
        <PlaceStrip icon={<Sparkles className="h-5 w-5 text-violet-500" />} title="New Places" places={newPlaces} scroll />
      </div>
    </div>
  )
}
