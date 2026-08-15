function SentimentBar({ label, pct, colorClass, textColorClass, trackColorClass }: { label: string; pct: number; colorClass: string; textColorClass: string; trackColorClass: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className={`text-sm font-bold ${textColorClass}`}>{pct}%</span>
      </div>
      <div className={`h-2.5 w-full overflow-hidden rounded-full ${trackColorClass}`}>
        <div className={`h-full rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function SentimentBreakdown({
  positivePercent,
  neutralPercent,
  negativePercent,
}: {
  positivePercent: number
  neutralPercent: number
  negativePercent: number
}) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h2 className="text-base font-bold text-slate-900">Sentiment Breakdown</h2>
        <p className="mt-0.5 text-xs text-slate-500">Based on your reviews' star ratings</p>
      </div>

      <SentimentBar label="Positive" pct={positivePercent} colorClass="bg-emerald-500" textColorClass="text-emerald-700" trackColorClass="bg-emerald-100" />
      <SentimentBar label="Neutral" pct={neutralPercent} colorClass="bg-slate-400" textColorClass="text-slate-600" trackColorClass="bg-slate-100" />
      <SentimentBar label="Negative" pct={negativePercent} colorClass="bg-red-400" textColorClass="text-red-600" trackColorClass="bg-red-50" />

      <div className="border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-500">
        Positive = 4-5★, Neutral = 3★, Negative = 1-2★.
      </div>
    </div>
  )
}
