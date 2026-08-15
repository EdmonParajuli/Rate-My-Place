import { BarChart2 } from "lucide-react"
import { useAuthMeUserQuery, useMyBadgesQuery, useMyReviewsQuery } from "@/lib/graphql/generated/graphql"
import { StatsRow } from "../myReviews/StatsRow"
import { ReviewVolumeChart } from "../dashboard/ReviewVolumeChart"
import { ProfileHeader } from "./ProfileHeader"
import { BadgeGrid } from "./BadgeGrid"
import { RecentReviewsPreview } from "./RecentReviewsPreview"
import { groupReviewsByMonth } from "./activityMonths"
import type { MyReview } from "../myReviews/types"

// Read-only, same as Phase 6 Settings' AccountTab - no updateUser/
// updateProfile mutation exists yet (docs/02-current-state.md), so there's
// nothing to edit here. Stats/activity/recent-reviews all reuse myReviews
// client-side (StatsRow's precedent: no reviewer-side backend aggregate
// exists); the badge grid reuses myBadges as-is.
export function ProfilePage() {
  const { data: meData, loading: meLoading } = useAuthMeUserQuery()
  const { data: reviewsData, loading: reviewsLoading } = useMyReviewsQuery({ variables: { first: 50 } })
  const { data: badgesData } = useMyBadgesQuery()

  const me = meData?.authMeUser?.data
  const reviews = (reviewsData?.myReviews?.data ?? []).filter((r): r is MyReview => r !== null)
  const badges = (badgesData?.myBadges?.data ?? []).filter((b): b is NonNullable<typeof b> => b !== null)

  const totalReviews = reviews.length
  const helpfulVotes = reviews.reduce((sum, r) => sum + (r.helpfulCount ?? 0), 0)
  const businesses = new Set(reviews.map((r) => r.place?.id).filter((id) => id !== null && id !== undefined)).size
  const monthlyActivity = groupReviewsByMonth(reviews)

  if (meLoading || reviewsLoading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Loading your profile...</p>
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-12">
      <ProfileHeader
        name={me?.fullName ?? "Account"}
        userType={me?.userType ?? null}
        profilePicture={me?.profilePicture ?? null}
        memberSince={me?.createdAt}
      />

      <StatsRow totalReviews={totalReviews} helpfulVotes={helpfulVotes} businesses={businesses} />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Review Activity</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BarChart2 className="h-3.5 w-3.5" />
            Last 6 months
          </span>
        </div>
        <div className="mt-3 h-48">
          <ReviewVolumeChart data={monthlyActivity} />
        </div>
      </div>

      <BadgeGrid badges={badges} />

      <RecentReviewsPreview reviews={reviews} />
    </div>
  )
}
