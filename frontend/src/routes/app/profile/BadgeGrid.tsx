import { Lock } from "lucide-react"
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

// The full earned-vs-locked grid docs/specs/phase-5-badges.md explicitly
// deferred to this ticket - unlike BadgeStrip.tsx's compact My Reviews row
// (icon + label + tooltip only), every card here always shows its
// description text, since "what do I still need to do" is the point of a
// dedicated badge grid.
export function BadgeGrid({ badges }: { badges: BadgeItem[] }) {
  if (badges.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-bold">Badges</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Achievements earned from writing and voting on reviews.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((badge) => {
          const Icon = getBadgeIcon(badge.icon)
          const earned = !!badge.earned
          return (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-2 rounded-xl px-3 py-4 text-center ${earned ? "bg-amber-50" : "bg-slate-50"}`}
            >
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-full ${
                  earned ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                <Icon className="h-5 w-5" />
                {!earned && (
                  <span className="absolute -right-0.5 -bottom-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-400 text-white">
                    <Lock className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
              <p className={`text-xs font-bold ${earned ? "text-slate-800" : "text-slate-400"}`}>{badge.label}</p>
              <p className={`text-[11px] leading-tight ${earned ? "text-slate-600" : "text-slate-400"}`}>{badge.description}</p>
              <p className="text-[10px] font-semibold text-muted-foreground">{earned ? `Earned ${formatDate(badge.earnedAt)}` : "Locked"}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
