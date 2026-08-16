// Refresh token only - the access token is held in memory (AuthContext state),
// never persisted, per docs/05-frontend-plan.md's MVP auth decision: a page
// reload survives (refresh token here converts back into a fresh access
// token), but an XSS payload reading localStorage can't lift a live access
// token, only the weaker refresh token.
const REFRESH_TOKEN_KEY = "rmp_refresh_token"
// So the Security settings section can mark "this device" in the
// activeSessions list (docs/specs/phase-7-settings-account-edit.md) - same
// lifecycle as the refresh token: set on login/signup/refresh, cleared on
// logout.
const SESSION_ID_KEY = "rmp_session_id"

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearStoredRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getStoredSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY)
}

export function setStoredSessionId(sessionId: string): void {
  localStorage.setItem(SESSION_ID_KEY, sessionId)
}

export function clearStoredSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY)
}
