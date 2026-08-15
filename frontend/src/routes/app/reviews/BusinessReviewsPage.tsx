import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Clock, MessageSquare, Star } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { useBusinessDashboardQuery, useCreateReviewReplyMutation, usePlaceReviewsQuery } from "@/lib/graphql/generated/graphql"
import { ReviewCard } from "../placeDetail/ReviewCard"
import type { PlaceReview } from "../placeDetail/types"

const PAGE_SIZE = 5

export function BusinessReviewsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<"all" | "needs">("all")
  const [sort, setSort] = useState<"RECENT" | "HELPFUL">("RECENT")
  const [page, setPage] = useState(1)

  const { data: dashboardData, loading: dashboardLoading } = useBusinessDashboardQuery()
  const stats = dashboardData?.businessDashboard?.data

  const { data: reviewsData, refetch } = usePlaceReviewsQuery({
    variables: { placeId: stats?.placeId ?? 0, first: 1000, sort },
    skip: !stats?.placeId,
  })
  const reviews = (reviewsData?.placeReviews?.data ?? []).filter((r): r is PlaceReview => r !== null)

  const [createReviewReply] = useCreateReviewReplyMutation()

  const handleSubmitReply = async (reviewId: number, text: string) => {
    await createReviewReply({ variables: { reviewId, input: { description: text } } })
    await refetch()
  }

  if (dashboardLoading) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading reviews...</p>
  }
  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-700">No business listing found</p>
        <p className="mt-1 text-sm text-muted-foreground">Your reviews will appear here once your listing is set up.</p>
      </div>
    )
  }

  const needsReply = reviews.filter((r) => !r.reply)
  const filtered = filter === "needs" ? needsReply : reviews
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Reviews</h1>
        <p className="mt-1 text-sm text-slate-500">Manage and respond to customer feedback.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatTile icon={MessageSquare} iconBgClass="bg-violet-50" iconColorClass="text-violet-500" value={String(stats.reviewCount ?? 0)} label="Total Reviews" />
        <StatTile
          icon={Star}
          iconBgClass="bg-amber-50"
          iconColorClass="text-accent"
          value={(stats.averageRating ?? 0).toFixed(1)}
          label="Average Rating"
          sub="out of 5.0"
        />
        <StatTile
          icon={Clock}
          iconBgClass="bg-rose-50"
          iconColorClass="text-rose-500"
          value={String(needsReply.length)}
          label="Awaiting Reply"
          highlight={needsReply.length > 0}
        />
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 self-start rounded-xl bg-slate-100 p-1">
          {(["all", "needs"] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                setPage(1)
              }}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f === "all" ? (
                "All Reviews"
              ) : (
                <>
                  Needs Response
                  {needsReply.length > 0 && <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">{needsReply.length}</span>}
                </>
              )}
            </button>
          ))}
        </div>

        <div className="relative self-start sm:self-auto">
          <select
            className="appearance-none rounded-xl border border-border bg-white px-4 py-2 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-primary"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as "RECENT" | "HELPFUL")
              setPage(1)
            }}
          >
            <option value="RECENT">Most Recent</option>
            <option value="HELPFUL">Most Helpful</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {paged.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <MessageSquare className="h-6 w-6 text-emerald-500" />
          </div>
          <p className="font-bold text-slate-900">All caught up!</p>
          <p className="mt-1 text-sm text-slate-500">Every review has been replied to. Great work.</p>
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {paged.map((review) => (
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer rounded-xl border border-border p-2 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 w-9 cursor-pointer rounded-xl text-sm font-semibold transition-all ${
                  n === page ? "bg-primary text-primary-foreground shadow-md shadow-blue-200" : "border border-border text-slate-600 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cursor-pointer rounded-xl border border-border p-2 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatTile({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  value,
  label,
  sub,
  highlight,
}: {
  icon: typeof MessageSquare
  iconBgClass: string
  iconColorClass: string
  value: string
  label: string
  sub?: string
  highlight?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm ${highlight ? "border-amber-200" : "border-border"}`}>
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${iconBgClass}`}>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </div>
      <div>
        <p className={`text-xl font-black tracking-tight ${highlight ? "text-amber-600" : "text-slate-900"}`}>{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}
