// Module-level, not React state - the Apollo auth link (constructed once,
// outside any component) reads this on every request via getAccessToken();
// AuthContext is the only writer, via setAccessToken() whenever it changes
// (login, refresh-on-load, logout).
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}
