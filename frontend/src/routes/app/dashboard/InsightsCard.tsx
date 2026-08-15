import { Lightbulb } from "lucide-react"

export function InsightsCard({ insights }: { insights: string[] }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Timely Insights</h2>
      {insights.map((text, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{text}</p>
        </div>
      ))}
    </div>
  )
}
