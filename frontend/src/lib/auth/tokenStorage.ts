// Refresh token only - the access token is held in memory (AuthContext state),
// never persisted, per docs/05-frontend-plan.md's MVP auth decision: a page
// reload survives (refresh token here converts back into a fresh access
// token), but an XSS payload reading localStorage can't lift a live access
// token, only the weaker refresh token.
const REFRESH_TOKEN_KEY = "rmp_refresh_token"

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setStoredRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearStoredRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}
