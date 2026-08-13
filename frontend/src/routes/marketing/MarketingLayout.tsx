import { Outlet } from "react-router-dom"

// Logged-out shell (nav + footer) - placeholder until the Phase 4 marketing
// landing page (docs/specs/phase-4-frontend-mvp.md) is built.
export function MarketingLayout() {
  return (
    <div className="min-h-svh">
      <Outlet />
    </div>
  )
}
