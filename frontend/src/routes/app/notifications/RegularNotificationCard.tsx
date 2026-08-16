import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import { getNotificationIcon } from "@/lib/notificationIcons"
import { formatDate } from "@/lib/formatDate"
import { UserAvatar } from "@/components/UserAvatar"

type NotificationItem = {
  id?: number | null
  type?: string | null
  message?: string | null
  placeId?: number | null
  place?: { id?: number | null; label?: string | null } | null
  read?: boolean | null
  createdAt?: string | null
}

// Avatar-first row, matching the regular-user Figma source's notification
// cards - this product has no per-notification actor photo/name anywhere
// (no avatar data exists for "who wrote this reply" etc.), so the place's
// label stands in for the avatar's initials wherever a placeId exists
// (every type except BADGE_EARNED, which falls back to a plain icon circle
// since it isn't about a place or another person).
export function RegularNotificationCard({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: NotificationItem
  onMarkRead: () => Promise<void>
  onDelete: () => Promise<void>
}) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const Icon = getNotificationIcon(notification.type)
  const unread = !notification.read

  const handleClick = async () => {
    if (unread) await onMarkRead()
    if (notification.placeId) {
      navigate(`/app/places/${notification.placeId}`)
    } else if (notification.type === "BADGE_EARNED") {
      navigate("/app/my-reviews")
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
        unread ? "border-primary/20 bg-blue-50/50 hover:bg-blue-100/40" : "border-border bg-card hover:bg-slate-50"
      }`}
    >
      {unread && <span className="absolute top-4.5 left-4.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
      <div className={`relative flex-shrink-0 ${unread ? "ml-4" : ""}`}>
        {notification.place?.label ? (
          <>
            <UserAvatar name={notification.place.label} profilePicture={null} className="h-10 w-10 rounded-full" />
            <div className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card">
              <Icon className="h-3 w-3 text-primary" />
            </div>
          </>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <Icon className="h-4 w-4 text-emerald-600" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${unread ? "font-semibold text-slate-900" : "text-slate-600"}`}>{notification.message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(notification.createdAt)}</p>
      </div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex-shrink-0 cursor-pointer rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed"
        aria-label="Delete notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
