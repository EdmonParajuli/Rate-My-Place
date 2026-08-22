import { useState } from "react"
import { BarChart2, Lock, Sparkles, TrendingUp, Users } from "lucide-react"
import { useBusinessDashboardQuery, useGetPlaceByIdQuery } from "@/lib/graphql/generated/graphql"
import { RatingTrendChart } from "../dashboard/RatingTrendChart"
import { ReviewVolumeChart } from "../dashboard/ReviewVolumeChart"
import { RatingDistributionChart } from "./RatingDistributionChart"

type Range = "3" | "6" | "12"

const RANGE_LABEL: Record<Range, string> = { "3": "Last 3 mo.", "6": "Last 6 mo.", "12": "Last 12 mo." }

// Illustrative only - no keyword/NLP or competitor-benchmark backend exists.
// Same treatment as the Dashboard's UpsellBanner: static, clearly labeled as
// a Pro preview rather than presented as real data.
const SAMPLE_KEYWORDS = [
  { label: "great coffee", count: 87 },
  { label: "friendly staff", count: 74 },
  { label: "cozy atmosphere", count: 61 },
  { label: "wait times", count: 43 },
  { label: "pricing", count: 21 },
]

export function AnalyticsPage() {
  const [range, setRange] = useState<Range>("12")

  const { data: dashboardData, loading: dashboardLoading } = useBusinessDashboardQuery()
  const stats = dashboardData?.businessDashboard?.data

  const { data: placeData } = useGetPlaceByIdQuery({ variables: { id: stats?.placeId ?? 0 }, skip: !stats?.placeId })
  const place = placeData?.getPlaceById?.data

  if (dashboardLoading) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading analytics...</p>
  }
  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-700">No business listing found</p>
        <p className="mt-1 text-sm text-muted-foreground">Analytics will appear here once your listing is set up.</p>
      </div>
    )
  }

  const n = Number(range)
  const ratingTrend = (stats.ratingTrend ?? []).map((p) => ({ month: p?.month ?? "", averageRating: p?.averageRating ?? null })).slice(-n)
  const reviewVolume = (stats.reviewVolume ?? []).map((p) => ({ month: p?.month ?? "", reviewCount: p?.reviewCount ?? 0 })).slice(-n)
  const breakdown = (place?.ratingBreakdown ?? [])
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .map((b) => ({ stars: b.stars ?? 0, count: b.count ?? 0 }))
  const volumeInRange = reviewVolume.reduce((sum, p) => sum + p.reviewCount, 0)

  return (
    <div className="space-y-7 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">Reputation trends and review insights.</p>
        </div>
        <div className="flex gap-1 self-start rounded-xl bg-slate-100 p-1 sm:self-auto">
          {(["3", "6", "12"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                range === r ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Rating Trend</h2>
            <p className="mt-0.5 text-xs text-slate-500">Average star rating per month</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" />
            {RANGE_LABEL[range]}
          </span>
        </div>
        <div className="h-64">
          <RatingTrendChart data={ratingTrend} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Review Volume</h2>
            <p className="mt-0.5 text-xs text-slate-500">Number of reviews received per month</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary">
            <BarChart2 className="h-3.5 w-3.5" />
            {volumeInRange} in range
          </span>
        </div>
        <div className="h-64">
          <ReviewVolumeChart data={reviewVolume} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-900">Rating Distribution</h2>
          <p className="mt-0.5 text-xs text-slate-500">Review count by star value · all time</p>
        </div>
        {breakdown.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : (
          <RatingDistributionChart breakdown={breakdown} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProPreviewPanel title="Keyword Mentions" subtitle="Topics appearing in your reviews">
          <div className="flex flex-wrap gap-2.5 py-2">
            {SAMPLE_KEYWORDS.map((kw) => (
              <span key={kw.label} className="rounded-full border border-border bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                {kw.label}
                <span className="ml-1.5 text-[10px] font-normal text-slate-400">{kw.count}</span>
              </span>
            ))}
          </div>
        </ProPreviewPanel>

        <ProPreviewPanel title="Competitor Benchmark" subtitle="How you compare in your category">
          <div className="space-y-4">
            <BenchmarkRow name={stats.placeName ?? "Your business"} rating={stats.averageRating ?? 0} isYou />
            <BenchmarkRow name="Category average" rating={3.9} />
          </div>
        </ProPreviewPanel>
      </div>
    </div>
  )
}

function ProPreviewPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
        <span className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
          <Lock className="h-2.5 w-2.5" />
          Sample data · Pro
        </span>
      </div>

      <div className="relative">
        <div className="pointer-events-none blur-[1.5px] select-none">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/60 backdrop-blur-[1px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-slate-800">Unlock with Pro</p>
          <button className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-blue-200">
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  )
}

function BenchmarkRow({ name, rating, isYou }: { name: string; rating: number; isYou?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${isYou ? "text-primary" : "text-slate-700"}`}>{name}</span>
          {isYou && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-primary">You</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-800">★ {rating.toFixed(1)}</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Users className="h-3 w-3" />
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${isYou ? "bg-primary" : "bg-slate-300"}`} style={{ width: `${(rating / 5) * 100}%` }} />
      </div>
    </div>
  )
}
