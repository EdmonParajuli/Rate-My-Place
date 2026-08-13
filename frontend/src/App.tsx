import { ApolloProvider } from "@apollo/client/react"
import { RouterProvider } from "react-router-dom"
import { apolloClient } from "@/lib/graphql/client"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { router } from "@/routes/router"

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ApolloProvider>
  )
}

export default App
