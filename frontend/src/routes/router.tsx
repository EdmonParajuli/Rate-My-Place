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
import { SavedPage } from "./app/saved/SavedPage"
import { PlaceDetailPage } from "./app/placeDetail/PlaceDetailPage"
import { BusinessDashboardPage } from "./app/dashboard/BusinessDashboardPage"
import { MyListingPage } from "./app/myListing/MyListingPage"
import { BusinessReviewsPage } from "./app/reviews/BusinessReviewsPage"
import { AnalyticsPage } from "./app/analytics/AnalyticsPage"
import { PromotionsPage } from "./app/promotions/PromotionsPage"
import { SettingsPage } from "./app/settings/SettingsPage"
import { NotificationsPage } from "./app/notifications/NotificationsPage"
import { ProfilePage } from "./app/profile/ProfilePage"

export const router = createBrowserRouter([
  {
    element: <MarketingLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
    ],
  },
  // Public QR scan entry (docs/specs/phase-11-qr-review-flow.md, ticket 03) -
  // deliberately outside both MarketingLayout (no marketing chrome belongs on
  // a scan-and-go flow) and PrivateRoute (must render before login).
  // PlaceDetailPage itself branches on the `token` param vs. `placeId` below
  // to source its data from the public placeByReviewToken query instead of
  // the authenticated getPlaceById one.
  { path: "r/:token", element: <PlaceDetailPage /> },
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
          { path: "saved", element: <SavedPage /> },
          { path: "my-reviews", element: <MyReviewsPage /> },
          { path: "places/:placeId", element: <PlaceDetailPage /> },
          { path: "dashboard", element: <BusinessDashboardPage /> },
          { path: "my-listing", element: <MyListingPage /> },
          { path: "reviews", element: <BusinessReviewsPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "promotions", element: <PromotionsPage /> },
          { path: "settings", element: <SettingsPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
])
