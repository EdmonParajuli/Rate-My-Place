import { Sparkles, Zap } from "lucide-react"

// Fully static/cosmetic - no plan/billing system exists anywhere in this
// product yet. See docs/specs/phase-6-business-dashboard.md's Non-goals.
export function UpsellBanner() {
  return (
    <div
      className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl border border-blue-200 p-7 sm:flex-row sm:items-center"
      style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #FFF7ED 100%)" }}
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-48 w-48 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 left-16 h-40 w-40 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-md shadow-blue-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-slate-900">Unlock deeper analytics with Pro</p>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Get competitor benchmarking, keyword topic analysis, AI-generated review summaries, and priority
            placement on search results.
          </p>
        </div>
      </div>

      <div className="relative flex flex-shrink-0 items-center gap-3">
        <button className="cursor-pointer text-sm font-medium whitespace-nowrap text-slate-500 transition-colors hover:text-slate-800">
          Learn more
        </button>
        <button className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-bold whitespace-nowrap text-white shadow-md shadow-blue-600/20 transition-all hover:scale-105 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg">
          <Zap className="h-4 w-4" />
          Upgrade to Pro
        </button>
      </div>
    </div>
  )
}
