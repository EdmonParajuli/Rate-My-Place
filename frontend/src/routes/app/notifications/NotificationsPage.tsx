import { useAuth } from "@/lib/auth/AuthContext"
import { BusinessNotificationsPage } from "./BusinessNotificationsPage"
import { RegularNotificationsPage } from "./RegularNotificationsPage"

// Thin persona router, same pattern as Settings' SettingsPage.tsx - the two
// account types have different Notifications designs in their own Figma
// sources (a full category-tab page for REGULAR vs. BUSINESS's own
// topbar-bell pattern, kept as its existing implementation per explicit
// direction rather than rebuilt). Kept as the single import router.tsx/
// AppLayout.tsx point at so neither needs a persona-aware path. See
// docs/specs/phase-7-profile-notifications-persona-fix.md.
export function NotificationsPage() {
  const { user } = useAuth()
  return user?.userType === "BUSINESS" ? <BusinessNotificationsPage /> : <RegularNotificationsPage />
}
