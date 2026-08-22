import { useEffect, useState } from "react"
import { useListPlacesQuery, useCategoriesQuery, type PlaceSortEnum } from "@/lib/graphql/generated/graphql"
import { useGeolocation } from "./useGeolocation"
import { DiscoverListView } from "./DiscoverListView"
import { MapView } from "./MapView"
import { LocationBlockedModal } from "./LocationBlockedModal"
import { EMPTY_FILTERS, type DiscoverFilters } from "./filterTypes"
import type { DiscoverPlace } from "./types"

const PAGE_SIZE = 12
const DEBOUNCE_MS = 300

export function DiscoverPage() {
  const [view, setView] = useState<"list" | "map">("list")
  const [filters, setFilters] = useState<DiscoverFilters>(EMPTY_FILTERS)
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sort, setSort] = useState<PlaceSortEnum>("HIGHEST_RATED")
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [places, setPlaces] = useState<DiscoverPlace[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [locationBlocked, setLocationBlocked] = useState(false)
  const geo = useGeolocation()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(filters.query), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [filters.query])

  // NEAREST needs real coordinates the backend requires - falls back to
  // HIGHEST_RATED results while a geolocation request is pending/denied
  // rather than erroring the whole list; "Nearby" stays visually selected.
  const effectiveSort = sort === "NEAREST" && !geo.coords ? "HIGHEST_RATED" : sort
  const effectiveNear = sort === "NEAREST" && geo.coords ? geo.coords : undefined

  const filterInput = {
    query: debouncedQuery || undefined,
    categoryId: filters.categoryId ?? undefined,
    priceRange: filters.priceRange ?? undefined,
    minRating: filters.minRating || undefined,
    openNow: filters.openNow || undefined,
  }

  const { data, loading, fetchMore } = useListPlacesQuery({
    variables: { sort: effectiveSort, near: effectiveNear, filter: filterInput, first: PAGE_SIZE },
  })

  useEffect(() => {
    setPlaces((data?.listPlaces?.data ?? []).filter((p): p is DiscoverPlace => p !== null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const pageInfo = data?.listPlaces?.pageInfo

  const handleLoadMore = async () => {
    if (!pageInfo?.endCursor) return
    setLoadingMore(true)
    try {
      const result = await fetchMore({ variables: { after: pageInfo.endCursor } })
      const nextPlaces = (result.data?.listPlaces?.data ?? []).filter((p): p is DiscoverPlace => p !== null)
      setPlaces((prev) => [...prev, ...nextPlaces])
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSortChange = (nextSort: PlaceSortEnum) => {
    setSort(nextSort)
    if (nextSort === "NEAREST" && !geo.coords) {
      geo.request()
    }
  }

  // Edge case 3.3: map view is gated on real geolocation, not just a
  // one-time "auto-fit" attempt - allowing zooms the map to the user's own
  // location (see MapView); denying blocks the view entirely behind
  // LocationBlockedModal instead of falling back to a whole-world map.
  const handleShowMap = async () => {
    const coords = await geo.request()
    if (coords) {
      setView("map")
    } else {
      setLocationBlocked(true)
    }
  }

  const { data: categoriesData } = useCategoriesQuery()
  const categories = (categoriesData?.categories?.data ?? [])
    .filter((c) => c !== null && c.id !== null && c.label !== null)
    .map((c) => ({ id: c!.id!, label: c!.label! }))

  const { data: trendingData } = useListPlacesQuery({ variables: { sort: "TRENDING", first: 4 } })
  const trendingPlaces = (trendingData?.listPlaces?.data ?? [])
    .filter((p): p is DiscoverPlace => p !== null)
    .filter((p) => (p.trendingScore ?? 0) > 0)

  const { data: newData } = useListPlacesQuery({ variables: { sort: "NEW", first: 4 } })
  const newPlaces = (newData?.listPlaces?.data ?? []).filter((p): p is DiscoverPlace => p !== null)

  if (view === "map") {
    return (
      <MapView
        places={places}
        loading={loading}
        query={filters.query}
        onQueryChange={(query) => setFilters({ ...filters, query })}
        onBackToList={() => setView("list")}
        userCoords={geo.coords}
      />
    )
  }

  return (
    <>
      <DiscoverListView
        places={places}
        loading={loading}
        hasNextPage={pageInfo?.hasNextPage ?? false}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        sort={sort}
        onSortChange={handleSortChange}
        filters={filters}
        onFiltersChange={setFilters}
        filterPanelOpen={filterPanelOpen}
        onToggleFilterPanel={() => setFilterPanelOpen((v) => !v)}
        categories={categories}
        geolocationError={geo.error}
        trendingPlaces={trendingPlaces}
        newPlaces={newPlaces}
        onShowMap={handleShowMap}
      />
      {locationBlocked && (
        <LocationBlockedModal
          retrying={geo.requesting}
          error={geo.error}
          onRetry={handleShowMap}
          onClose={() => setLocationBlocked(false)}
        />
      )}
    </>
  )
}
