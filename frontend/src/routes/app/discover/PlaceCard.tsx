import { Link } from "react-router-dom"
import { BadgeCheck, Flame, MapPin, Star } from "lucide-react"
import { SaveHeartButton } from "@/components/SaveHeartButton"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import type { DiscoverPriceRange } from "./filterTypes"
import type { DiscoverPlace } from "./types"

// coverPhotoUrl is real (Phase 8) but still null for most places - no upload
// flow exists for it yet (seeded directly for now, see
// docs/specs/phase-8-media-plumbing.md). Falls back to a category-tinted
// placeholder instead of faking a stock photo, reusing the same accent data
// the Categories screen uses.
function PlaceImagePlaceholder({ categoryLabel }: { categoryLabel: string | null | undefined }) {
  const style = categoryLabel ? CATEGORY_STYLES[categoryLabel] : undefined
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${style?.gradient ?? "from-slate-300 to-slate-400"}`}>
      <MapPin className="h-8 w-8 text-white/70" />
    </div>
  )
}

const PRICE_SYMBOL: Record<DiscoverPriceRange, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" }

export function PlaceCard({
  place,
  compact = false,
  showSaveButton = true,
}: {
  place: DiscoverPlace
  compact?: boolean
  // Off for HeroSearchResults' logged-out landing-page preview - saving a
  // place calls toggleSavePlace, which requireAuth's on the backend, and
  // that surface can't assume a signed-in caller the way every other
  // PlaceCard usage (all gated behind PrivateRoute) safely can.
  showSaveButton?: boolean
}) {
  const rating = place.averageRating ?? 0

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative bg-slate-100" style={{ height: compact ? 120 : 160 }}>
        {place.coverPhotoUrl ? (
          <img src={place.coverPhotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <PlaceImagePlaceholder categoryLabel={place.category?.label} />
        )}
        {showSaveButton && place.id !== null && place.id !== undefined && (
          <div className="absolute top-2.5 right-2.5">
            <SaveHeartButton placeId={place.id} initialSaved={place.savedByMe} size="sm" />
          </div>
        )}
        {place.isVerified ? (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-bold text-white">
            <BadgeCheck className="h-3 w-3" />
            Verified
          </div>
        ) : (place.trendingScore ?? 0) > 0 ? (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold text-white">
            <Flame className="h-3 w-3" />
            Trending
          </div>
        ) : null}
        {place.openNow !== null && place.openNow !== undefined && (
          <div
            className={`absolute bottom-2.5 left-2.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${
              place.openNow ? "bg-emerald-500" : "bg-slate-600"
            }`}
          >
            {place.openNow ? "Open" : "Closed"}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-0.5 truncate text-sm leading-snug font-bold">{place.label}</h3>
        {place.category?.label && <p className="mb-2 text-xs text-muted-foreground">{place.category.label}</p>}
        <div className="mb-1.5 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`}
              />
            ))}
          </div>
          <span className="text-sm font-bold">{rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({(place.reviewCount ?? 0).toLocaleString()})</span>
          {place.priceRange && <span className="ml-auto text-xs font-medium text-slate-400">{PRICE_SYMBOL[place.priceRange]}</span>}
        </div>
        <div className="mt-auto mb-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{place.address}</span>
          {typeof place.distance === "number" && <span className="flex-shrink-0">· {place.distance.toFixed(1)} km</span>}
        </div>
        <Button place={place} />
      </div>
    </div>
  )
}

function Button({ place }: { place: DiscoverPlace }) {
  return (
    <Link
      to={`/app/places/${place.id}`}
      className="w-full rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground hover:bg-blue-700"
    >
      View Place
    </Link>
  )
}
