import { MessageSquare, Star, Award, Bell, type LucideIcon } from "lucide-react"

// NotificationTypeEnum is fixed code (not seed data like Category.icon/
// Badge.icon), so a plain Record is enough - no fallback-icon lookup case
// needed, Bell only covers a value this union can't actually produce.
const NOTIFICATION_ICONS: Record<string, LucideIcon> = {
  REVIEW_REPLY: MessageSquare,
  NEW_REVIEW: Star,
  BADGE_EARNED: Award,
}

export function getNotificationIcon(type: string | null | undefined): LucideIcon {
  return (type && NOTIFICATION_ICONS[type]) || Bell
}
