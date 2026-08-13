import { Star } from "lucide-react"
import type { PlaceDetail } from "./types"

export function RatingOverview({ place }: { place: PlaceDetail }) {
  const breakdown = (place.ratingBreakdown ?? []).filter((b) => b !== null)
  const total = breakdown.reduce((sum, b) => sum + (b!.count ?? 0), 0)

  return (
    <div className="flex items-center gap-8">
      <div className="flex-shrink-0 text-center">
        <p className="text-5xl leading-none font-extrabold">{(place.averageRating ?? 0).toFixed(1)}</p>
        <div className="mt-1 flex justify-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < Math.round(place.averageRating ?? 0) ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{total.toLocaleString()} reviews</p>
      </div>
      <div className="flex-1 space-y-2">
        {breakdown.map((entry) => {
          const stars = entry!.stars ?? 0
          const count = entry!.count ?? 0
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-3 text-right text-xs font-semibold text-muted-foreground">{stars}</span>
              <Star className="h-3 w-3 flex-shrink-0 fill-accent text-accent" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-8 text-xs text-muted-foreground">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
