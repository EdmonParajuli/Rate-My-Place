import { createBrowserRouter } from "react-router-dom"
import { MarketingLayout } from "./marketing/MarketingLayout"
import { HomePage } from "./marketing/HomePage"
import { AppLayout } from "./app/AppLayout"
import { DiscoverPage } from "./app/DiscoverPage"

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: "app",
    element: <AppLayout />,
    children: [{ index: true, element: <DiscoverPage /> }],
  },
])
