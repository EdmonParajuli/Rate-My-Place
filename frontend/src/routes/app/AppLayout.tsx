import { Outlet } from "react-router-dom"

// Authenticated shell (sidebar nav + top bar, per the Figma design) -
// placeholder until the Phase 4 Authenticated shell ticket is built. No
// <PrivateRoute> auth gating yet either - that needs the auth/token state
// from lib/auth/ (docs/05-frontend-plan.md's "Auth on the frontend"
// section), which doesn't exist yet.
export function AppLayout() {
  return (
    <div className="min-h-svh">
      <Outlet />
    </div>
  )
}
