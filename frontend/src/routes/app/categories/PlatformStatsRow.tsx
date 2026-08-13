import { Building2, Grid3x3, MessageSquare } from "lucide-react"

// All 3 numbers are real (platformStats + categories().data.length) - the
// prototype's own "56,700+ Total Businesses / 14M+ Reviews" were fabricated
// vanity copy; this map's charting session explicitly ruled out shipping
// fake numbers inside the authenticated app (docs/03-architecture.md's
// platform-wide stats section).
export function PlatformStatsRow({
  totalPlaces,
  totalCategories,
  totalReviews,
}: {
  totalPlaces: number
  totalCategories: number
  totalReviews: number
}) {
  const stats = [
    { value: totalPlaces.toLocaleString(), label: "Total Businesses", icon: Building2, colorClass: "text-primary bg-blue-50" },
    { value: totalCategories.toLocaleString(), label: "Categories", icon: Grid3x3, colorClass: "text-amber-600 bg-amber-50" },
    { value: totalReviews.toLocaleString(), label: "Reviews", icon: MessageSquare, colorClass: "text-emerald-600 bg-emerald-50" },
  ]

  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${stat.colorClass}`}>
            <stat.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg leading-tight font-extrabold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
