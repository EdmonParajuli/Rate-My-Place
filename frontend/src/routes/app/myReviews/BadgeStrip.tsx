import { getBadgeIcon } from "@/lib/badgeIcons"
import { formatDate } from "@/lib/formatDate"

type BadgeItem = {
  id?: number | null
  key?: string | null
  label?: string | null
  description?: string | null
  icon?: string | null
  earned?: boolean | null
  earnedAt?: string | null
}

// Compact strip, not the full Profile-screen grid - this is the interim
// surface for Phase 5's Badges ticket (Profile screen doesn't exist yet).
// Sits in the exact spot StatsRow.tsx's dropped "Contribution Level: Elite"
// stat card used to occupy.
export function BadgeStrip({ badges }: { badges: BadgeItem[] }) {
  if (badges.length === 0) return null

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold text-muted-foreground">Badges</p>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {badges.map((badge) => {
          const Icon = getBadgeIcon(badge.icon)
          const earned = !!badge.earned
          return (
            <div
              key={badge.id}
              title={earned ? badge.description ?? undefined : `Locked - ${badge.description ?? ""}`}
              className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-center ${earned ? "bg-amber-50" : "bg-slate-50 opacity-60"}`}
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${earned ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-400"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className={`text-[11px] font-semibold leading-tight ${earned ? "text-slate-800" : "text-slate-400"}`}>{badge.label}</p>
              <p className="text-[10px] text-muted-foreground">{earned ? formatDate(badge.earnedAt) : "Locked"}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
