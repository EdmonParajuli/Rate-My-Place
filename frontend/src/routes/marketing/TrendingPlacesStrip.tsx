import { Link } from "react-router-dom"
import { MapPin, Star } from "lucide-react"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import { useListPlacesQuery } from "@/lib/graphql/generated/graphql"
import type { TrendingPlace } from "./types"

// No live search/autocomplete on the marketing page (logged-out, static) -
// but this strip is real data, not mock cards: listPlaces(sort: TRENDING).
// Cards link into /app/places/:id same as Discover's PlaceCard - an
// unauthenticated click naturally lands on /login via PrivateRoute, which is
// the whole point of a logged-out landing page.
export function TrendingPlacesStrip() {
  const { data, loading } = useListPlacesQuery({ variables: { sort: "TRENDING", first: 8 } })
  const places = (data?.listPlaces?.data ?? []).filter((p): p is TrendingPlace => p !== null)

  if (loading) {
    return <p className="text-center text-sm text-muted-foreground">Loading trending places...</p>
  }
  if (places.length === 0) {
    return null
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-2">
      {places.map((place) => (
        <TrendingPlaceCard key={place.id} place={place} />
      ))}
    </div>
  )
}

function TrendingPlaceCard({ place }: { place: TrendingPlace }) {
  const style = place.category?.label ? CATEGORY_STYLES[place.category.label] : undefined
  const rating = place.averageRating ?? 0

  return (
    <Link
      to={`/app/places/${place.id}`}
      className="w-64 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className={`flex h-32 items-center justify-center bg-gradient-to-br ${style?.gradient ?? "from-slate-300 to-slate-400"}`}>
        <MapPin className="h-7 w-7 text-white/70" />
      </div>
      <div className="p-3">
        <h3 className="mb-1 truncate text-sm font-bold">{place.label}</h3>
        <div className="flex items-center gap-1 text-xs text-amber-700">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          {rating.toFixed(1)} · {(place.reviewCount ?? 0).toLocaleString()} reviews
        </div>
      </div>
    </Link>
  )
}
