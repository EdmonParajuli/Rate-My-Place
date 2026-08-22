import { useState } from "react"
import { Bell, CheckCheck } from "lucide-react"
import {
  useMyNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "@/lib/graphql/generated/graphql"
import { NotificationCard } from "./NotificationCard"

type Tab = "ALL" | "UNREAD"

// BUSINESS-only, unchanged from the original shared implementation - kept
// as-is per explicit direction rather than rebuilt against BUSINESS's own
// Figma source (a topbar bell+dropdown, no dedicated nav item/page at all).
// REGULAR gets its own screen instead - see RegularNotificationsPage.tsx and
// docs/specs/phase-7-profile-notifications-persona-fix.md.
export function BusinessNotificationsPage() {
  const [tab, setTab] = useState<Tab>("ALL")

  const { data, loading, refetch } = useMyNotificationsQuery({ variables: { filter: tab } })
  const [markNotificationRead] = useMarkNotificationReadMutation()
  const [markAllNotificationsRead] = useMarkAllNotificationsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()

  const notifications = (data?.myNotifications?.data ?? []).filter((n): n is NonNullable<typeof n> => n !== null)

  // refetchQueries on all 3 mutations - the nav pill's unread count is a
  // separate poll-based query (AppLayout.tsx, 30s interval); without this it
  // wouldn't reflect the user's own action until the next poll tick.
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
          <p className="mt-1 text-sm text-slate-500">Replies, new reviews, and badges you've earned.</p>
        </div>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          <CheckCheck className="h-3.5 w-3.5" />
          Mark all as read
        </button>
      </div>

      <div className="flex gap-1 self-start rounded-xl bg-slate-100 p-1" style={{ width: "fit-content" }}>
        {(["ALL", "UNREAD"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "ALL" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Bell className="h-6 w-6 text-slate-300" />
          </div>
          <p className="font-bold text-slate-900">{tab === "UNREAD" ? "You're all caught up" : "No notifications yet"}</p>
          <p className="mt-1 text-sm text-slate-500">
            {tab === "UNREAD" ? "No unread notifications right now." : "Replies, new reviews, and badges will show up here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <NotificationCard
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
