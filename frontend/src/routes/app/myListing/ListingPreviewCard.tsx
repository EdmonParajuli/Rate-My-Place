import { Clock, ExternalLink, Globe, Image, MapPin, Phone, Star } from "lucide-react"
import { formatTime } from "../placeDetail/formatHours"

const PRICE_SYMBOL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" }

export function ListingPreviewCard({
  categoryLabel,
  label,
  priceRange,
  averageRating,
  reviewCount,
  description,
  address,
  phone,
  website,
  todayHours,
  coverPhotoUrl,
}: {
  categoryLabel: string | null
  label: string
  priceRange: string
  averageRating: number
  reviewCount: number
  description: string
  address: string
  phone: string
  website: string
  todayHours: { open: boolean; opensAt: string; closesAt: string }
  coverPhotoUrl?: string | null
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex h-36 flex-col items-center justify-center gap-2 border-b border-border bg-slate-100">
        {coverPhotoUrl ? (
          <img src={coverPhotoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <>
            <Image className="h-8 w-8 text-slate-300" />
            <span className="text-xs font-medium text-slate-400">No cover photo yet</span>
          </>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="mb-1 text-[11px] font-bold tracking-wide text-primary uppercase">{categoryLabel ?? "Uncategorized"}</p>
            <h3 className="text-lg leading-tight font-extrabold text-slate-900">{label || "Your Business Name"}</h3>
          </div>
          <span className="flex-shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-sm font-bold text-slate-500">
            {PRICE_SYMBOL[priceRange] ?? "$$"}
          </span>
        </div>

        <div className="mb-3 flex items-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(averageRating) ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
          ))}
          <span className="ml-1 text-xs text-slate-500">
            {averageRating.toFixed(1)} · {reviewCount} reviews
          </span>
        </div>

        {description && <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">{description}</p>}

        <div className="space-y-2 text-sm text-slate-600">
          {address && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
              <span>{address}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <span>{phone}</span>
            </div>
          )}
          {website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <span className="text-primary">{website}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
            {todayHours.open ? (
              <span>
                Today: <span className="font-semibold text-emerald-600">Open</span> {formatTime(todayHours.opensAt)} –{" "}
                {formatTime(todayHours.closesAt)}
              </span>
            ) : (
              <span>
                Today: <span className="font-semibold text-destructive">Closed</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-slate-50 px-5 py-3">
        <span className="text-xs text-slate-400">Preview · as visitors see it</span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          <ExternalLink className="h-3 w-3" />
          View live
        </span>
      </div>
    </div>
  )
}
