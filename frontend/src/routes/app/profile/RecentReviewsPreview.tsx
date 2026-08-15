import { Link } from "react-router-dom"
import { MapPin, MessageSquare, Star } from "lucide-react"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import { formatDate } from "@/lib/formatDate"
import type { MyReview } from "../myReviews/types"

const PREVIEW_COUNT = 3

// Read-only preview, deliberately not ReviewListItem - that component's
// inline edit/delete forms belong to My Reviews' management surface, not a
// public-style profile view. Reuses the same place-icon/gradient treatment
// (CATEGORY_STYLES) so a review card looks the same wherever it's rendered.
export function RecentReviewsPreview({ reviews }: { reviews: MyReview[] }) {
  const recent = reviews.slice(0, PREVIEW_COUNT)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold">Recent Reviews</h2>
        <Link to="/app/my-reviews" className="text-xs font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center">
          <MessageSquare className="h-7 w-7 text-slate-300" />
          <p className="text-xs text-muted-foreground">Reviews you write will show up here.</p>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {recent.map((review) => {
            const style = review.place?.category?.label ? CATEGORY_STYLES[review.place.category.label] : undefined
            return (
              <Link
                key={review.id}
                to={`/app/places/${review.place?.id}`}
                className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${style?.gradient ?? "from-slate-300 to-slate-400"}`}
                >
                  <MapPin className="h-4 w-4 text-white/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-bold">{review.place?.label}</p>
                    <span className="flex-shrink-0 text-[11px] text-slate-400">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="mt-0.5 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < (review.rating ?? 0) ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{review.review}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
