import { createBrowserRouter } from "react-router-dom"
import { MarketingLayout } from "./marketing/MarketingLayout"
import { HomePage } from "./marketing/HomePage"
import { LoginPage } from "./auth/LoginPage"
import { PrivateRoute } from "@/components/PrivateRoute"
import { AppLayout } from "./app/AppLayout"
import { DiscoverPage } from "./app/discover/DiscoverPage"
import { CategoriesPage } from "./app/categories/CategoriesPage"
import { CategoryDetailPage } from "./app/categories/CategoryDetailPage"
import { MyReviewsPage } from "./app/myReviews/MyReviewsPage"
import { PlaceDetailPage } from "./app/placeDetail/PlaceDetailPage"
import { BusinessDashboardPage } from "./app/dashboard/BusinessDashboardPage"

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
          { path: "categories/:categoryId", element: <CategoryDetailPage /> },
          { path: "my-reviews", element: <MyReviewsPage /> },
          { path: "places/:placeId", element: <PlaceDetailPage /> },
          { path: "dashboard", element: <BusinessDashboardPage /> },
        ],
      },
    ],
  },
])
