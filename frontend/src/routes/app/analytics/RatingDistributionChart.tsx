import { Star } from "lucide-react"

const BAR_COLOR: Record<number, string> = {
  5: "bg-emerald-500",
  4: "bg-emerald-400",
  3: "bg-amber-500",
  2: "bg-orange-500",
  1: "bg-destructive",
}

export function RatingDistributionChart({ breakdown }: { breakdown: { stars: number; count: number }[] }) {
  const total = breakdown.reduce((sum, b) => sum + b.count, 0)

  return (
    <div className="space-y-3">
      {breakdown.map((entry) => {
        const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0
        return (
          <div key={entry.stars} className="flex items-center gap-3">
            <span className="flex w-8 flex-shrink-0 items-center gap-0.5 text-xs font-semibold text-slate-600">
              {entry.stars}
              <Star className="h-3 w-3 fill-accent text-accent" />
            </span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${BAR_COLOR[entry.stars] ?? "bg-primary"}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-16 flex-shrink-0 text-right text-xs text-slate-500">{entry.count} reviews</span>
          </div>
        )
      })}
    </div>
  )
}
