import type { MyReview } from "../myReviews/types"

const MONTHS_BACK = 6

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

// Last 6 calendar months, zero-filled so the chart never has gaps - same
// precedent as businessDashboardMath.ts's computeMonthlyBuckets, just
// computed client-side here since these are the reviewer's own myReviews
// rows, not a backend aggregate (no reviewer-side equivalent of the
// business dashboard's reviewVolumeByMonth query exists, matching
// StatsRow.tsx's "no backend aggregate" precedent).
export function groupReviewsByMonth(reviews: MyReview[]): { month: string; reviewCount: number }[] {
  const now = new Date()
  const counts = new Map<string, number>()
  for (let i = MONTHS_BACK - 1; i >= 0; i--) {
    const key = monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1))
    counts.set(key, 0)
  }

  for (const review of reviews) {
    if (!review.createdAt) continue
    const key = monthKey(new Date(Number(review.createdAt)))
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries()).map(([month, reviewCount]) => ({ month, reviewCount }))
}
