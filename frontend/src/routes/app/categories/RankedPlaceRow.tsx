import { Link } from "react-router-dom"
import { MapPin, Star } from "lucide-react"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import type { DiscoverPlace } from "../discover/types"

export function RankedPlaceRow({ place, rank }: { place: DiscoverPlace; rank: number }) {
  const style = place.category?.label ? CATEGORY_STYLES[place.category.label] : undefined

  return (
    <Link
      to={`/app/places/${place.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <span className="w-6 flex-shrink-0 text-2xl font-extrabold text-slate-200">#{rank}</span>
      <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style?.gradient ?? "from-slate-300 to-slate-400"}`}>
        <MapPin className="h-5 w-5 text-white/70" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{place.label}</p>
        <p className="truncate text-xs text-muted-foreground">{place.address}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span className="text-xs font-bold">{(place.averageRating ?? 0).toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({(place.reviewCount ?? 0).toLocaleString()})</span>
        </div>
      </div>
    </Link>
  )
}
