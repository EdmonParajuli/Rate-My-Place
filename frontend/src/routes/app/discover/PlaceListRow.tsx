import { Link } from "react-router-dom"
import { BadgeCheck, MapPin, Star } from "lucide-react"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import type { DiscoverPlace } from "./types"

// Compact row for the map view's list column - PlaceCard's full image+desc
// layout doesn't fit a ~380px sidebar.
export function PlaceListRow({ place, active, onHover }: { place: DiscoverPlace; active: boolean; onHover: (id: number | null) => void }) {
  const style = place.category?.label ? CATEGORY_STYLES[place.category.label] : undefined

  return (
    <Link
      to={`/app/places/${place.id}`}
      onMouseEnter={() => onHover(place.id ?? null)}
      onMouseLeave={() => onHover(null)}
      className={`flex gap-3 rounded-xl p-2 transition-colors ${active ? "bg-slate-100" : "hover:bg-slate-50"}`}
    >
      <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style?.gradient ?? "from-slate-300 to-slate-400"}`}>
        <MapPin className="h-5 w-5 text-white/70" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4 className="truncate text-sm font-bold">{place.label}</h4>
          {place.isVerified && <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">
          {place.category?.label}
          {place.priceRange ? ` · ${place.priceRange}` : ""}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="text-xs font-bold">{(place.averageRating ?? 0).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({place.reviewCount ?? 0})</span>
        </div>
      </div>
    </Link>
  )
}
