import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/lib/auth/AuthContext"
import { LoadingScreen } from "./LoadingScreen"

// Once AuthContext has resolved (see below) and there's genuinely no user, a
// bare instant <Navigate> reads as a jarring snap rather than a page
// transition - e.g. clicking "View Place" from the marketing search preview
// while logged out (docs/specs - HeroSearchResults) would otherwise vanish
// straight to the login form with zero visual feedback. This holds
// LoadingScreen up for one beat first, purely for that transition feel.
const REDIRECT_DELAY_MS = 500

// Gates the authenticated route branch - redirects to /login when no user is
// signed in. `initializing` covers the brief window while AuthContext's
// mount effect tries to trade a stored refresh token for a fresh session
// (see AuthContext.tsx), so a page reload doesn't flash a redirect before
// that resolves.
export function PrivateRoute() {
  const { user, initializing } = useAuth()
  const [readyToRedirect, setReadyToRedirect] = useState(false)

  useEffect(() => {
    if (initializing || user) {
      setReadyToRedirect(false)
      return
    }
    const timer = setTimeout(() => setReadyToRedirect(true), REDIRECT_DELAY_MS)
    return () => clearTimeout(timer)
  }, [initializing, user])

  if (initializing) {
    return <LoadingScreen />
  }

  if (!user) {
    return readyToRedirect ? <Navigate to="/login" replace /> : <LoadingScreen />
  }

  return <Outlet />
}
