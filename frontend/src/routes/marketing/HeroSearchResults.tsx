import { useLayoutEffect, useState, type RefObject } from "react"
import { createPortal } from "react-dom"
import { Loader2, Search as SearchIcon } from "lucide-react"
import { useListPlacesQuery } from "@/lib/graphql/generated/graphql"
import { PlaceCard } from "@/routes/app/discover/PlaceCard"
import type { DiscoverPlace } from "@/routes/app/discover/types"

const RESULT_LIMIT = 6

type Position = { top: number; left: number; width: number }

// Lets a logged-out visitor actually see real search results from the
// landing page instead of being bounced straight to /login on submit -
// listPlaces is public (no requireAuth, see
// backend/src/graphql/resolvers/placeResolver.ts), same query Discover
// itself uses. Reuses Discover's own PlaceCard for a consistent design
// (cover image, rating stars, review count) rather than a bespoke result
// row. "View Place" links to /app/places/:id like every other place link in
// the app; PrivateRoute naturally redirects an unauthenticated click to
// /login, the same pattern TrendingPlacesStrip already relies on.
//
// Portaled to document.body rather than rendered inline: the hero section
// (.hero-gradient, index.css) sets `overflow: hidden` to clip its
// background glow to the section bounds, which was also silently clipping
// this dropdown's bottom edge whenever results overflowed the hero -
// forcing an internal scrollbar inside an already-clipped box. Rendering at
// the body level escapes that ancestor entirely, so the panel floats above
// every later section instead of being cut off by one.
export function HeroSearchResults({
  query,
  anchorRef,
  rootRef,
}: {
  query: string
  anchorRef: RefObject<HTMLDivElement | null>
  rootRef: RefObject<HTMLDivElement | null>
}) {
  const trimmed = query.trim()
  const [position, setPosition] = useState<Position | null>(null)

  useLayoutEffect(() => {
    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width })
    }
    updatePosition()
    window.addEventListener("resize", updatePosition)
    return () => window.removeEventListener("resize", updatePosition)
  }, [anchorRef])

  const { data, loading } = useListPlacesQuery({
    variables: { filter: { query: trimmed }, first: RESULT_LIMIT },
    skip: !trimmed,
  })
  const places = (data?.listPlaces?.data ?? []).filter((p): p is DiscoverPlace => p !== null)

  if (!trimmed || !position) {
    return null
  }

  return createPortal(
    <div
      ref={rootRef}
      style={{ top: position.top, left: position.left, width: position.width }}
      className="absolute z-50 rounded-2xl bg-white p-3 text-left shadow-2xl"
    >
      {loading ? (
        <p className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching...
        </p>
      ) : places.length === 0 ? (
        <div className="py-8 text-center">
          <SearchIcon className="mx-auto mb-2 h-6 w-6 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No places found for "{trimmed}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} compact showSaveButton={false} />
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}
