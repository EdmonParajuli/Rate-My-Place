import { useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import {
  useMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  type MyNotificationsQuery,
} from "@/lib/graphql/generated/graphql"
import { RegularNotificationCard } from "./RegularNotificationCard"

type NotificationItem = NonNullable<NonNullable<NonNullable<MyNotificationsQuery["myNotifications"]>["data"]>[number]>

// REGULAR-only - matches its own Figma source's category-tab taxonomy
// (All/Reviews/Likes/Replies/Recommendations/System), not BUSINESS's
// unchanged 2-tab All/Unread page (BusinessNotificationsPage.tsx). See
// docs/specs/phase-7-profile-notifications-persona-fix.md. Only 3 of these
// tabs mapped to a real backend event when this screen was first built
// (Replies/System/plus the pre-existing All); Reviews (WATCHED_PLACE_REVIEW)
// and Likes (HELPFUL_VOTE_RECEIVED) are new triggering events added in this
// same ticket specifically to back these tabs for real. Recommendations has
// no backend event yet (a future phase's business-recommendation feature) -
// its tab exists per the Figma taxonomy but is always empty until then, not
// a fake/interactive preview.
const CATEGORIES: { label: string; types: string[] | null }[] = [
  { label: "All", types: null },
  { label: "Reviews", types: ["WATCHED_PLACE_REVIEW"] },
  { label: "Likes", types: ["HELPFUL_VOTE_RECEIVED"] },
  { label: "Replies", types: ["REVIEW_REPLY"] },
  { label: "Recommendations", types: [] },
  { label: "System", types: ["BADGE_EARNED"] },
]

export function RegularNotificationsPage() {
  const [category, setCategory] = useState("All")

  const { data, loading, refetch } = useMyNotificationsQuery({ variables: { filter: "ALL" } })
  const [markNotificationRead] = useMarkNotificationReadMutation()
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()

  const notifications: NotificationItem[] = (data?.myNotifications?.data ?? []).filter(
    (n): n is NonNullable<typeof n> => n !== null
  )
  const unreadTotal = notifications.filter((n) => !n.read).length

  const activeTypes = CATEGORIES.find((c) => c.label === category)?.types ?? null
  const display = activeTypes === null ? notifications : notifications.filter((n) => activeTypes.includes(n.type ?? ""))

  const handleMarkRead = async (notificationId: number) => {
    await markNotificationRead({ variables: { notificationId }, refetchQueries: ["UnreadNotificationCount"] })
    await refetch()
  }

  const handleDelete = async (notificationId: number) => {
    await deleteNotification({ variables: { notificationId }, refetchQueries: ["UnreadNotificationCount"] })
    await refetch()
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead({ refetchQueries: ["UnreadNotificationCount"] })
    await refetch()
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Notifications</h1>
          {unreadTotal > 0 && <p className="mt-1 text-sm text-muted-foreground">{unreadTotal} unread notification{unreadTotal !== 1 ? "s" : ""}</p>}
        </div>
        {unreadTotal > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((c) => {
          const count =
            c.types === null
              ? unreadTotal
              : notifications.filter((n) => c.types!.includes(n.type ?? "") && !n.read).length
          return (
            <button
              key={c.label}
              onClick={() => setCategory(c.label)}
              className={`flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                category === c.label ? "bg-primary text-primary-foreground" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {c.label}
              {count > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${category === c.label ? "bg-white text-primary" : "bg-rose-100 text-rose-600"}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
      ) : display.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-6 w-6 text-slate-300" />
          </div>
          <p className="font-bold text-slate-900">You're all caught up!</p>
          <p className="mt-1 text-sm text-slate-500">No notifications in this category.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {display.map((notification) => (
            <RegularNotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={() => handleMarkRead(notification.id!)}
              onDelete={() => handleDelete(notification.id!)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
