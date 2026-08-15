import { Award, Flame, ThumbsUp, Compass, Crown, type LucideIcon } from "lucide-react"

// Badge.icon is a lucide-react icon *name* string (kebab-case), seed-data
// managed (backend/src/migrations/20260815180000-create-badges-tables.js) -
// same lookup-not-dynamic-import pattern as categoryIcons.ts.
const BADGE_ICONS: Record<string, LucideIcon> = {
  award: Award,
  flame: Flame,
  "thumbs-up": ThumbsUp,
  compass: Compass,
  crown: Crown,
}

export function getBadgeIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && BADGE_ICONS[iconName]) || Award
}
