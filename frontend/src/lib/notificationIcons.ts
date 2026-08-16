import { MessageSquare, Star, Award, ThumbsUp, Bell, type LucideIcon } from "lucide-react"

// NotificationTypeEnum is fixed code (not seed data like Category.icon/
// Badge.icon), so a plain Record is enough - no fallback-icon lookup case
// needed, Bell only covers a value this union can't actually produce.
const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  REVIEW_REPLY: MessageSquare,
  NEW_REVIEW: Star,
  BADGE_EARNED: Award,
  WATCHED_PLACE_REVIEW: Star,
  HELPFUL_VOTE_RECEIVED: ThumbsUp,
}

export function getNotificationIcon(type: string | null | undefined): LucideIcon {
  return (type && NOTIFICATION_ICONS[type]) || Bell
}
