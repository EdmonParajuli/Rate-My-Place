import { createBrowserRouter } from "react-router-dom"
import { MarketingLayout } from "./marketing/MarketingLayout"
import { HomePage } from "./marketing/HomePage"
import { LoginPage } from "./auth/LoginPage"
import { PrivateRoute } from "@/components/PrivateRoute"
import { AppLayout } from "./app/AppLayout"
import { DiscoverPage } from "./app/discover/DiscoverPage"
import { CategoriesPage } from "./app/CategoriesPage"
import { MyReviewsPage } from "./app/MyReviewsPage"
import { PlaceDetailPage } from "./app/PlaceDetailPage"

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
  {
    path: "app",
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DiscoverPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "my-reviews", element: <MyReviewsPage /> },
          { path: "places/:placeId", element: <PlaceDetailPage /> },
        ],
      },
    ],
  },
])
