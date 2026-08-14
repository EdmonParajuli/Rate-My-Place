import { Building2, MessageSquare, ThumbsUp } from "lucide-react"

// 3 cards, not the real Figma source's 4 - "Contribution Level: Elite" is
// dropped (Phase 5 badges concept, no backend support exists). All 3 are
// computed client-side from the full myReviews list - no totalCount on
// PageInfo, no backend aggregate (docs/specs/phase-4-frontend-mvp.md §7).
export function StatsRow({ totalReviews, helpfulVotes, businesses }: { totalReviews: number; helpfulVotes: number; businesses: number }) {
  const stats = [
    { value: totalReviews, label: "Total Reviews", icon: MessageSquare, colorClass: "text-primary bg-blue-50" },
    { value: helpfulVotes, label: "Helpful Votes", icon: ThumbsUp, colorClass: "text-emerald-600 bg-emerald-50" },
    { value: businesses, label: "Businesses", icon: Building2, colorClass: "text-amber-600 bg-amber-50" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${stat.colorClass}`}>
            <stat.icon className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold">{stat.value.toLocaleString()}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
