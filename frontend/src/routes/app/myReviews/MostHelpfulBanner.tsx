import { Award } from "lucide-react"
import type { MyReview } from "./types"

export function MostHelpfulBanner({ review }: { review: MyReview }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 p-4">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
        <Award className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-white">Most Helpful Review</p>
        <p className="mt-0.5 text-xs text-amber-100">
          Your {review.place?.label} review has been marked helpful {review.helpfulCount ?? 0} times — your most impactful review yet!
        </p>
      </div>
    </div>
  )
}
