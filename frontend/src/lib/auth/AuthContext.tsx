import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import {
  useLoginMutation,
  useSignUpMutation,
  useSignUpBusinessMutation,
  useSignOutMutation,
  useRefreshAccessTokenMutation,
  useAuthMeUserLazyQuery,
  type InputAuthLogin,
  type InputAuthSignUp,
  type InputSignUpBusiness,
} from "@/lib/graphql/generated/graphql"
import { getAccessToken, setAccessToken } from "./accessToken"
import { getStoredRefreshToken, setStoredRefreshToken, clearStoredRefreshToken } from "./tokenStorage"

type AuthUser = {
  id: number
  email: string | null
  fullName: string | null
  userType: string | null
  profilePicture: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  initializing: boolean
  login: (input: InputAuthLogin) => Promise<void>
  signUp: (input: InputAuthSignUp) => Promise<void>
  signUpBusiness: (input: InputSignUpBusiness) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  // Starts true - resolved by the mount effect below (attempts a refresh from
  // any stored refresh token before deciding whether the user is logged in),
  // so route guards don't flash a logged-out state on every page load.
  const [initializing, setInitializing] = useState(true)

  const [loginMutation] = useLoginMutation()
  const [signUpMutation] = useSignUpMutation()
  const [signUpBusinessMutation] = useSignUpBusinessMutation()
  const [signOutMutation] = useSignOutMutation()
  const [refreshAccessTokenMutation] = useRefreshAccessTokenMutation()
  const [fetchAuthMeUser] = useAuthMeUserLazyQuery({ fetchPolicy: "network-only" })

  const applySession = useCallback(
    (token: { access?: string | null; refresh?: string | null } | null | undefined, sessionUser: AuthUser | null | undefined) => {
      setAccessToken(token?.access ?? null)
      if (token?.refresh) {
        setStoredRefreshToken(token.refresh)
      }
      setUser(sessionUser ?? null)
    },
    []
  )

  const clearSession = useCallback(() => {
    setAccessToken(null)
    clearStoredRefreshToken()
    setUser(null)
  }, [])

  // On mount: a stored refresh token means a previous session exists - trade
  // it for a fresh access token (and a rotated refresh token, since
  // SessionService.renew revokes+rotates on every use) so a page reload
  // doesn't force a re-login, per docs/05-frontend-plan.md's MVP auth
  // decision. No stored token, or a rejected one (expired/revoked), just
  // means starting logged out.
  useEffect(() => {
    const storedRefreshToken = getStoredRefreshToken()
    if (!storedRefreshToken) {
      setInitializing(false)
      return
    }

    refreshAccessTokenMutation({ variables: { input: { refreshToken: storedRefreshToken } } })
      .then(async (result) => {
        const token = result.data?.refreshAccessToken?.data
        if (!token?.access) {
          clearSession()
          return
        }
        setAccessToken(token.access)
        if (token.refresh) {
          setStoredRefreshToken(token.refresh)
        }
        const meResult = await fetchAuthMeUser()
        setUser((meResult.data?.authMeUser?.data as AuthUser | null | undefined) ?? null)
      })
      .catch(() => clearSession())
      .finally(() => setInitializing(false))
    // Intentionally empty deps - runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(
    async (input: InputAuthLogin) => {
      const result = await loginMutation({ variables: { input } })
      const data = result.data?.login?.data
      applySession(data?.token, data?.user as AuthUser | null | undefined)
    },
    [loginMutation, applySession]
  )

  const signUp = useCallback(
    async (input: InputAuthSignUp) => {
      const result = await signUpMutation({ variables: { input } })
      const data = result.data?.signUp?.data
      applySession(data?.token, data?.user as AuthUser | null | undefined)
    },
    [signUpMutation, applySession]
  )

  const signUpBusiness = useCallback(
    async (input: InputSignUpBusiness) => {
      const result = await signUpBusinessMutation({ variables: { input } })
      const data = result.data?.signUpBusiness?.data
      applySession(data?.token, data?.user as AuthUser | null | undefined)
    },
    [signUpBusinessMutation, applySession]
  )

  const logout = useCallback(async () => {
    const refreshToken = getStoredRefreshToken()
    if (refreshToken) {
      // Best-effort - a failed revoke shouldn't block the client-side logout.
      await signOutMutation({ variables: { input: { refreshToken } } }).catch(() => undefined)
    }
    clearSession()
  }, [signOutMutation, clearSession])

  return (
    <AuthContext.Provider value={{ user, initializing, login, signUp, signUpBusiness, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}

export { getAccessToken }
