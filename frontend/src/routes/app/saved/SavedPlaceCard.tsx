import { useState } from "react"
import { Star, Trash2 } from "lucide-react"
import { PlaceCard } from "../discover/PlaceCard"
import type { DiscoverPlace } from "../discover/types"

const LIST_TYPE_BADGE: Record<string, { label: string; className: string }> = {
  SAVED: { label: "Saved", className: "bg-slate-100 text-slate-600" },
  WANT_TO_VISIT: { label: "Want to Visit", className: "bg-blue-50 text-primary" },
  FAVORITE: { label: "Favorite", className: "bg-amber-50 text-accent" },
}

const RECATEGORIZE_OPTIONS: { value: "SAVED" | "WANT_TO_VISIT" | "FAVORITE"; label: string }[] = [
  { value: "WANT_TO_VISIT", label: "Want to Visit" },
  { value: "FAVORITE", label: "Favorite" },
  { value: "SAVED", label: "Just Saved" },
]

// Shared wrapper for all four Saved tabs - a small meta-row (badge + date +
// hover-reveal actions) on top of the existing PlaceCard, not a from-scratch
// card design. The Reviewed tab passes no onRemove/onRecategorize since
// there's no saved-place row behind it to act on (see
// docs/specs/phase-5-saved-places.md) - it only ever shows a "Reviewed"
// badge.
export function SavedPlaceCard({
  place,
  listType,
  dateLabel,
  onRemove,
  onRecategorize,
}: {
  place: DiscoverPlace
  listType: "SAVED" | "WANT_TO_VISIT" | "FAVORITE" | "REVIEWED"
  dateLabel: string
  onRemove?: () => Promise<void>
  onRecategorize?: (listType: "SAVED" | "WANT_TO_VISIT" | "FAVORITE") => Promise<void>
}) {
  const [removing, setRemoving] = useState(false)
  const badge = LIST_TYPE_BADGE[listType] ?? { label: "Reviewed", className: "bg-emerald-50 text-emerald-600" }

  const handleRemove = async () => {
    if (!onRemove) return
    setRemoving(true)
    try {
      await onRemove()
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="group flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
            {listType === "REVIEWED" && <Star className="mr-1 inline h-2.5 w-2.5 fill-current align-[-1px]" />}
            {badge.label}
          </span>
          <span className="text-[11px] text-muted-foreground">{dateLabel}</span>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed"
            aria-label="Remove from saved places"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <PlaceCard place={place} />

      {onRecategorize && (
        <div className="flex flex-wrap gap-1.5 px-0.5">
          {RECATEGORIZE_OPTIONS.filter((opt) => opt.value !== listType).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onRecategorize(opt.value)}
              className="cursor-pointer rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-slate-500 hover:border-primary hover:text-primary"
            >
              Move to {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
