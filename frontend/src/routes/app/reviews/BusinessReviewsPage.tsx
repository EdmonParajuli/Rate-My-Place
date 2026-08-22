import { useEffect, useState } from "react"
import { ChevronDown, Clock, MessageSquare, Star } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { useBusinessDashboardQuery, useCreateReviewReplyMutation, usePlaceReviewsQuery } from "@/lib/graphql/generated/graphql"
import { ReviewCard } from "../placeDetail/ReviewCard"
import type { PlaceReview } from "../placeDetail/types"

const PAGE_SIZE = 10

export function BusinessReviewsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<"all" | "needs">("all")
  const [sort, setSort] = useState<"RECENT" | "HELPFUL">("RECENT")
  const [reviews, setReviews] = useState<PlaceReview[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  const { data: dashboardData, loading: dashboardLoading } = useBusinessDashboardQuery()
  const stats = dashboardData?.businessDashboard?.data

  // Genuine server-side cursor pagination (edge case 3.6), not a bigger
  // fixed `first`. Bug 1's fix (first: 1000 -> first: 50) was only a
  // mitigation - fetch-all-then-paginate-client-side still hits the same
  // query-complexity ceiling once any business passes ~90 reviews, no
  // matter which fixed number is chosen. This fetches one modest page at a
  // time and appends via `after` (the same fetchMore/pageInfo shape
  // DiscoverPage already uses for "Load more"), so the request size never
  // grows with how many reviews a business has.
  const { data: reviewsData, fetchMore, refetch } = usePlaceReviewsQuery({
    variables: { placeId: stats?.placeId ?? 0, first: PAGE_SIZE, sort },
    skip: !stats?.placeId,
  })

  useEffect(() => {
    setReviews((reviewsData?.placeReviews?.data ?? []).filter((r): r is PlaceReview => r !== null))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewsData])

  const pageInfo = reviewsData?.placeReviews?.pageInfo

  const handleLoadMore = async () => {
    if (!pageInfo?.endCursor) return
    setLoadingMore(true)
    try {
      const result = await fetchMore({ variables: { after: pageInfo.endCursor } })
      const nextReviews = (result.data?.placeReviews?.data ?? []).filter((r): r is PlaceReview => r !== null)
      setReviews((prev) => [...prev, ...nextReviews])
    } finally {
      setLoadingMore(false)
    }
  }

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

  // Sourced from the dashboard's own reviewCount/repliedCount snapshot
  // (computeDashboardStats), not derived from `reviews` - `reviews` is only
  // whatever's been loaded so far via Load More, so counting through it
  // would undercount exactly like Bug 1 did once a business has more
  // reviews than one page.
  const pendingReplyCount = stats.pendingReplyCount ?? 0
  const filtered = filter === "needs" ? reviews.filter((r) => !r.reply) : reviews

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
          value={String(pendingReplyCount)}
          label="Awaiting Reply"
          highlight={pendingReplyCount > 0}
        />
      </div>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 self-start rounded-xl bg-slate-100 p-1">
          {(["all", "needs"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f === "all" ? (
                "All Reviews"
              ) : (
                <>
                  Needs Response
                  {pendingReplyCount > 0 && <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white">{pendingReplyCount}</span>}
                </>
              )}
            </button>
          ))}
        </div>

        <div className="relative self-start sm:self-auto">
          <select
            className="appearance-none rounded-xl border border-border bg-white px-4 py-2 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-primary"
            value={sort}
            onChange={(e) => setSort(e.target.value as "RECENT" | "HELPFUL")}
          >
            <option value="RECENT">Most Recent</option>
            <option value="HELPFUL">Most Helpful</option>
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {filtered.length === 0 ? (
        filter === "needs" && pendingReplyCount > 0 ? (
          // The loaded batch (sorted by RECENT/HELPFUL, not "unreplied
          // first") just doesn't happen to contain any of the
          // pendingReplyCount reviews still awaiting a reply - they're
          // further back. Distinct from the real "All caught up!" state
          // below, which would otherwise be shown falsely here.
          <div className="rounded-2xl border border-border bg-card p-14 text-center">
            <p className="font-bold text-slate-900">None of these are awaiting a reply</p>
            <p className="mt-1 text-sm text-slate-500">
              {pendingReplyCount} review{pendingReplyCount === 1 ? "" : "s"} still {pendingReplyCount === 1 ? "needs" : "need"} a reply further back —
              load more to find {pendingReplyCount === 1 ? "it" : "them"}.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <MessageSquare className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="font-bold text-slate-900">All caught up!</p>
            <p className="mt-1 text-sm text-slate-500">Every review has been replied to. Great work.</p>
          </div>
        )
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card">
          {filtered.map((review) => (
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

      <div className="flex flex-col items-center gap-2 pt-2">
        <p className="text-xs text-muted-foreground">
          {reviews.length} of {stats.reviewCount ?? reviews.length} reviews loaded
        </p>
        {pageInfo?.hasNextPage && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="cursor-pointer rounded-xl border border-border px-6 py-2.5 text-sm font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
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
