import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import { getNotificationIcon } from "@/lib/notificationIcons"
import { formatDate } from "@/lib/formatDate"

type NotificationItem = {
  id?: number | null
  type?: string | null
  message?: string | null
  placeId?: number | null
  read?: boolean | null
  createdAt?: string | null
}

export function NotificationCard({
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
      className={`group flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
        unread ? "border-primary/20 bg-blue-50/50" : "border-border bg-card"
      } hover:border-primary/40`}
    >
      <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${unread ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-400"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${unread ? "font-semibold text-slate-900" : "text-slate-600"}`}>{notification.message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(notification.createdAt)}</p>
      </div>
      {unread && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="cursor-pointer rounded-lg p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-rose-50 hover:text-destructive group-hover:opacity-100 disabled:cursor-not-allowed"
        aria-label="Delete notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
