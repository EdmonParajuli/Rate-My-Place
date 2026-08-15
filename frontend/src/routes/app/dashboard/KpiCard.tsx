import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

export function KpiCard({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  label,
  value,
  trendLabel,
  trend,
}: {
  icon: LucideIcon
  iconBgClass: string
  iconColorClass: string
  label: string
  value: string
  trendLabel: string
  trend: number
}) {
  const trendUp = trend >= 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClass}`}>
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <div
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
            trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
          }`}
        >
          {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {trendUp ? "+" : ""}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{trendLabel}</p>
      </div>
    </div>
  )
}
