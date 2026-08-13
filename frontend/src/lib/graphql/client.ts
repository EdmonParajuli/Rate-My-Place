import { ApolloClient, InMemoryCache } from "@apollo/client"
import { HttpLink } from "@apollo/client/link/http"
import { SetContextLink } from "@apollo/client/link/context"
import { getAccessToken } from "@/lib/auth/accessToken"

// VITE_GRAPHQL_URL overrides this for non-local environments; the backend's
// default dev port (backend/.env's PORT) is 4000. Apollo Client v4 dropped
// the v3 `uri` shorthand on ApolloClient's own options - a link (HttpLink)
// must be constructed and passed explicitly.
const uri = import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql"

// Reads the access token fresh on every request (not captured once at
// construction time) - AuthContext is the only writer, via setAccessToken().
// No automatic silent-refresh-and-retry on a 401 mid-session yet - out of
// scope for this pass; a page reload (which does refresh, see AuthContext)
// or a manual re-login recovers today.
const authLink = new SetContextLink((prevContext) => {
  const token = getAccessToken()
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  }
})

export const apolloClient = new ApolloClient({
  link: authLink.concat(new HttpLink({ uri })),
  cache: new InMemoryCache(),
})
