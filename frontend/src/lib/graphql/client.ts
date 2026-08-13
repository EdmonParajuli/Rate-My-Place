import { ApolloClient, InMemoryCache } from "@apollo/client"
import { HttpLink } from "@apollo/client/link/http"

// VITE_GRAPHQL_URL overrides this for non-local environments; the backend's
// default dev port (backend/.env's PORT) is 4000. Apollo Client v4 dropped
// the v3 `uri` shorthand on ApolloClient's own options - a link (HttpLink)
// must be constructed and passed explicitly.
const uri = import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql"

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri }),
  cache: new InMemoryCache(),
})
