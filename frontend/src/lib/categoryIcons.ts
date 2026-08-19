import {
  UtensilsCrossed,
  Coffee,
  Hotel,
  ShoppingBag,
  Stethoscope,
  GraduationCap,
  Dumbbell,
  Scissors,
  Music,
  Briefcase,
  Beer,
  Building2,
  Store,
  type LucideIcon,
} from "lucide-react"

// Category.icon is a lucide-react icon *name* string (kebab-case), seed-data
// managed (src/seeders/20260813130000-update-categories-to-figma-ten.js) -
// not a component reference, so it needs a lookup rather than dynamic
// import (safer than importing lucide's whole barrel just to resolve an
// arbitrary string, and fails predictably - a real fallback icon, not a
// blank render - if a future seeded category uses a name not yet mapped
// here).
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "utensils-crossed": UtensilsCrossed,
  coffee: Coffee,
  hotel: Hotel,
  "shopping-bag": ShoppingBag,
  stethoscope: Stethoscope,
  "graduation-cap": GraduationCap,
  dumbbell: Dumbbell,
  scissors: Scissors,
  music: Music,
  briefcase: Briefcase,
  beer: Beer,
  "building-2": Building2,
}

export function getCategoryIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && CATEGORY_ICONS[iconName]) || Store
}
