import { ApolloProvider } from "@apollo/client/react"
import { RouterProvider } from "react-router-dom"
import { apolloClient } from "@/lib/graphql/client"
import { AuthProvider } from "@/lib/auth/AuthContext"
import { ThemeProvider } from "@/lib/theme/ThemeContext"
import { router } from "@/routes/router"

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
