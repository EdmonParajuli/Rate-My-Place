import { ApolloProvider } from "@apollo/client/react"
import { RouterProvider } from "react-router-dom"
import { apolloClient } from "@/lib/graphql/client"
import { router } from "@/routes/router"

function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <RouterProvider router={router} />
    </ApolloProvider>
  )
}

export default App
