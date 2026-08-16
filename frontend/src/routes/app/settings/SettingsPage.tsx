import { useAuth } from "@/lib/auth/AuthContext"
import { BusinessSettingsPage } from "./BusinessSettingsPage"
import { RegularSettingsPage } from "./RegularSettingsPage"

// Thin persona router - the two account types have genuinely different
// Settings designs in their respective Figma sources (see
// docs/specs/phase-7-settings-account-edit.md), not one shared screen. Kept
// as the single import router.tsx/AppLayout point at so neither needs a
// persona-aware path.
export function SettingsPage() {
  const { user } = useAuth()
  return user?.userType === "BUSINESS" ? <BusinessSettingsPage /> : <RegularSettingsPage />
}
