import { useState } from "react"
import { Link } from "react-router-dom"
import { CheckCircle2, MessageSquare, ShieldCheck, Star, TrendingUp, BarChart2 } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { usePlaceReviewsQuery, useCreateReviewReplyMutation } from "@/lib/graphql/generated/graphql"
import { useBusinessDashboardQuery } from "@/lib/graphql/generated/graphql"
import { ReviewCard } from "../placeDetail/ReviewCard"
import type { PlaceReview } from "../placeDetail/types"
import { KpiCard } from "./KpiCard"
import { RatingTrendChart } from "./RatingTrendChart"
import { ReviewVolumeChart } from "./ReviewVolumeChart"
import { SentimentBreakdown } from "./SentimentBreakdown"
import { InsightsCard } from "./InsightsCard"
import { UpsellBanner } from "./UpsellBanner"

type ReviewFilter = "needs" | "all"

export function BusinessDashboardPage() {
  const { user } = useAuth()
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("needs")

  const { data: dashboardData, loading: dashboardLoading, refetch: refetchDashboard } = useBusinessDashboardQuery()
  const stats = dashboardData?.businessDashboard?.data

  const { data: reviewsData, refetch: refetchReviews } = usePlaceReviewsQuery({
    variables: { placeId: stats?.placeId ?? 0, first: 20, sort: "RECENT" },
    skip: !stats?.placeId,
  })
  const reviews = (reviewsData?.placeReviews?.data ?? []).filter((r): r is PlaceReview => r !== null)

  const [createReviewReply] = useCreateReviewReplyMutation()

  const handleSubmitReply = async (reviewId: number, text: string) => {
    await createReviewReply({ variables: { reviewId, input: { description: text } } })
    await Promise.all([refetchReviews(), refetchDashboard()])
  }

  if (dashboardLoading) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading dashboard...</p>
  }
  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-700">No business listing found</p>
        <p className="mt-1 text-sm text-muted-foreground">Your dashboard will appear here once your listing is set up.</p>
      </div>
    )
  }

  const needsReply = reviews.filter((r) => !r.reply)
  const displayed = reviewFilter === "needs" ? needsReply : reviews

  const ratingTrend = (stats.ratingTrend ?? []).map((p) => ({ month: p?.month ?? "", averageRating: p?.averageRating ?? null }))
  const reviewVolume = (stats.reviewVolume ?? []).map((p) => ({ month: p?.month ?? "", reviewCount: p?.reviewCount ?? 0 }))

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-500">{stats.placeName}</p>
        </div>
        <Link
          to={`/app/places/${stats.placeId}`}
          className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          View Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={ShieldCheck}
          iconBgClass="bg-blue-50"
          iconColorClass="text-primary"
          label="Reputation Score"
          value={String(stats.reputationScore)}
          trend={stats.reputationScoreTrend ?? 0}
          trendLabel="vs. last month · out of 100"
        />
        <KpiCard
          icon={Star}
          iconBgClass="bg-amber-50"
          iconColorClass="text-accent"
          label="Average Rating"
          value={(stats.averageRating ?? 0).toFixed(1)}
          trend={stats.averageRatingTrend ?? 0}
          trendLabel="vs. last month · out of 5.0"
        />
        <KpiCard
          icon={MessageSquare}
          iconBgClass="bg-violet-50"
          iconColorClass="text-violet-500"
          label="Total Reviews"
          value={String(stats.reviewCount)}
          trend={stats.reviewCountTrend ?? 0}
          trendLabel="new this month"
        />
        <KpiCard
          icon={CheckCircle2}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-500"
          label="Response Rate"
          value={`${stats.responseRate ?? 0}%`}
          trend={stats.responseRateTrend ?? 0}
          trendLabel="vs. last month"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Rating Trend</h2>
              <p className="mt-0.5 text-xs text-slate-500">Average star rating per month</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              Last 12 months
            </span>
          </div>
          <div className="h-60">
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
              {stats.reviewCount} total
            </span>
          </div>
          <div className="h-60">
            <ReviewVolumeChart data={reviewVolume} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Reviews</h2>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setReviewFilter("needs")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  reviewFilter === "needs" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Needs Response{" "}
                {needsReply.length > 0 && (
                  <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] text-white">{needsReply.length}</span>
                )}
              </button>
              <button
                onClick={() => setReviewFilter("all")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  reviewFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                All Reviews
              </button>
            </div>
          </div>

          {displayed.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-400" />
              <p className="font-bold text-slate-900">All caught up!</p>
              <p className="mt-1 text-sm text-slate-500">Every review has an owner reply. Nice work.</p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border bg-card">
              {displayed.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  isMine={false}
                  isOwnerViewing
                  ownerName={user?.fullName}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onToggleHelpful={() => {}}
                  onSubmitReply={(text) => (review.id ? handleSubmitReply(review.id, text) : Promise.resolve())}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <SentimentBreakdown
            positivePercent={stats.sentiment?.positivePercent ?? 0}
            neutralPercent={stats.sentiment?.neutralPercent ?? 0}
            negativePercent={stats.sentiment?.negativePercent ?? 0}
          />
          <InsightsCard insights={(stats.insights ?? []).filter((i): i is string => i !== null)} />
        </div>
      </div>

      <UpsellBanner />
    </div>
  )
}
