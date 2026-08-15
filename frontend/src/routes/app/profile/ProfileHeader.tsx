import { CalendarDays } from "lucide-react"
import { UserAvatar } from "@/components/UserAvatar"
import { formatDate } from "@/lib/formatDate"

// Cover banner is a static brand-gradient bar, not per-user data - no cover
// photo concept exists anywhere in this product yet (Phase 8 Media is where
// any real photo upload, avatar included, eventually lands). Decorative
// chrome only, so it doesn't need the "illustrative preview" labeling Phase
// 6's Promotions page needed - it isn't standing in for an unbuilt feature.
export function ProfileHeader({
  name,
  userType,
  profilePicture,
  memberSince,
}: {
  name: string
  userType: string | null
  profilePicture: string | null
  memberSince: string | null | undefined
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-24 bg-gradient-to-r from-primary to-blue-400 sm:h-28" />
      <div className="flex flex-col items-center gap-3 px-5 pb-5 sm:flex-row sm:items-end sm:gap-4">
        <UserAvatar
          name={name}
          profilePicture={profilePicture}
          className="-mt-10 h-20 w-20 flex-shrink-0 rounded-full border-4 border-card text-lg sm:-mt-12 sm:h-24 sm:w-24"
        />
        <div className="min-w-0 flex-1 pt-1 text-center sm:pt-0 sm:text-left">
          <h1 className="truncate text-xl font-extrabold">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              {userType === "BUSINESS" ? "Business owner" : "Reviewer"}
            </span>
            {memberSince && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Member since {formatDate(memberSince)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
