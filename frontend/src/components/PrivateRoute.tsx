import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/lib/auth/AuthContext"

// Gates the authenticated route branch - redirects to /login when no user is
// signed in. `initializing` covers the brief window while AuthContext's
// mount effect tries to trade a stored refresh token for a fresh session
// (see AuthContext.tsx), so a page reload doesn't flash a redirect before
// that resolves.
export function PrivateRoute() {
  const { user, initializing } = useAuth()

  if (initializing) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
