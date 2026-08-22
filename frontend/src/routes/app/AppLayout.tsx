import { useEffect, useRef, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Star,
  Search,
  Grid3x3,
  Heart,
  MessageSquare,
  LayoutDashboard,
  Store,
  BarChart2,
  Megaphone,
  Settings,
  Bell,
  User,
  MoreHorizontal,
  LogOut,
  Menu,
  X,
  QrCode,
} from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { UserAvatar } from "@/components/UserAvatar"
import { userTypeLabel } from "@/lib/userTypeLabel"
import { useUnreadNotificationCountQuery } from "@/lib/graphql/generated/graphql"

// Variant A from prototype/authenticated-shell (docs/specs/phase-4-frontend-mvp.md
// §3) - w-60 sidebar. Originally identical for REGULAR and BUSINESS users (a
// Phase 4 stopgap: "no dashboard placeholder to build and discard" since
// Business Dashboard didn't exist yet). Phase 6 revisits this now that it
// does: REGULAR and BUSINESS are mutually-exclusive account types in this
// product, not a dual-role account, and Discover/Categories/My Reviews are
// reviewer-persona features with no tie to managing a business listing - so
// BUSINESS accounts get their own nav instead of the reviewer nav with
// Dashboard appended. The full 6-item console
// (docs/specs/phase-6-business-console-figma-prompt.md) now exists: Dashboard,
// My Listing, Reviews, Analytics, Promotions, Settings.
// Desktop collapse-to-icon-rail toggle with hover tooltips, mobile hamburger
// + slide-over (the real Figma source had zero mobile handling), a working
// Log out (the source had none).
const REVIEWER_NAV_ITEMS = [
  { to: "/app", label: "Discover", icon: Search, end: true },
  { to: "/app/categories", label: "Categories", icon: Grid3x3, end: false },
  { to: "/app/saved", label: "Saved", icon: Heart, end: false },
  { to: "/app/my-reviews", label: "My Reviews", icon: MessageSquare, end: false },
  { to: "/app/notifications", label: "Notifications", icon: Bell, end: false },
  { to: "/app/profile", label: "Profile", icon: User, end: false },
  { to: "/app/settings", label: "Settings", icon: Settings, end: false },
]

const BUSINESS_NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard, end: false },
  { to: "/app/my-listing", label: "My Listing", icon: Store, end: false },
  { to: "/app/reviews", label: "Reviews", icon: MessageSquare, end: false },
  { to: "/app/analytics", label: "Analytics", icon: BarChart2, end: false },
  { to: "/app/promotions", label: "Promotions", icon: Megaphone, end: false },
  { to: "/app/settings", label: "Settings", icon: Settings, end: false },
  { to: "/app/notifications", label: "Notifications", icon: Bell, end: false },
]

// Paths only reachable from the reviewer nav above - a BUSINESS account
// landing on one directly (a stale bookmark, browser back/forward) gets
// bounced to their own console rather than a page with no nav item
// highlighted. /app/places/:id is deliberately NOT included here - the
// Dashboard's "View Listing" link depends on BUSINESS accounts keeping
// access to it.
const REVIEWER_ONLY_PATH_PREFIXES = ["/app/categories", "/app/saved", "/app/my-reviews", "/app/profile"]

const SCREEN_META: Record<string, { title: string; subtitle: string }> = {
  "/app": { title: "Discover Places", subtitle: "Find and explore places near you" },
  "/app/categories": { title: "Categories", subtitle: "Browse places by type" },
  "/app/saved": { title: "Saved", subtitle: "Places you've saved, want to visit, or already reviewed" },
  "/app/my-reviews": { title: "My Reviews", subtitle: "All your published reviews" },
  "/app/dashboard": { title: "Business Dashboard", subtitle: "Your listing's reputation and reviews" },
  "/app/my-listing": { title: "My Listing", subtitle: "Edit how your business appears to visitors" },
  "/app/reviews": { title: "Reviews", subtitle: "Manage and respond to customer feedback" },
  "/app/analytics": { title: "Analytics", subtitle: "Reputation trends and review insights" },
  "/app/promotions": { title: "Promotions", subtitle: "Create offers and boost your listing visibility" },
  "/app/settings": { title: "Settings", subtitle: "Manage your account and notification preferences" },
  "/app/notifications": { title: "Notifications", subtitle: "Replies, new reviews, and badges you've earned" },
  "/app/profile": { title: "Profile", subtitle: "Your stats, activity, and badges" },
  "/app/qr-code": { title: "Review QR Code", subtitle: "Share this so customers can review you in seconds" },
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMobileOpen(false), [location.pathname])

  // Single poll for the whole shell (not per-nav-item) - no websockets/
  // subscriptions exist in this codebase, so a 30s poll is the "start
  // simple" approximation of live unread-count updates.
  const { data: unreadData } = useUnreadNotificationCountQuery({ pollInterval: 30000 })
  const unreadCount = unreadData?.unreadNotificationCount ?? 0

  const isBusiness = user?.userType === "BUSINESS"

  useEffect(() => {
    if (!isBusiness) return
    const onReviewerOnlyPath =
      location.pathname === "/app" || REVIEWER_ONLY_PATH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))
    if (onReviewerOnlyPath) {
      navigate("/app/dashboard", { replace: true })
    }
  }, [isBusiness, location.pathname, navigate])

  useEffect(() => {
    if (!dropdownOpen) return
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("click", onClickOutside)
    return () => document.removeEventListener("click", onClickOutside)
  }, [dropdownOpen])

  const meta = SCREEN_META[location.pathname] ?? (isBusiness ? SCREEN_META["/app/dashboard"] : SCREEN_META["/app"])
  const displayName = user?.fullName ?? "Account"
  const navItems = isBusiness ? BUSINESS_NAV_ITEMS : REVIEWER_NAV_ITEMS

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 z-40 flex h-screen flex-shrink-0 flex-col border-r border-border bg-card transition-[width,transform] duration-200 md:sticky md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[4.5rem]" : "w-60"}`}
      >
        <div className={`flex items-center gap-2.5 border-b border-border px-5 py-4 transition-[gap] duration-200 ${collapsed ? "md:gap-0" : ""}`}>
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-blue-200">
            <Star className="h-4 w-4 fill-white text-white" />
          </div>
          <span
            className={`overflow-hidden font-extrabold whitespace-nowrap transition-[opacity,max-width] duration-200 ${
              collapsed ? "md:max-w-0 md:opacity-0" : "max-w-[200px] opacity-100"
            }`}
          >
            Rate My Place
          </span>
          <button className="ml-auto cursor-pointer text-slate-400 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  collapsed ? "md:justify-center md:px-0" : ""
                } ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-blue-200"
                    : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0" />
              <span className={`flex-1 ${collapsed ? "md:hidden" : ""}`}>{label}</span>
              {to === "/app/notifications" && unreadCount > 0 && (
                <span
                  className={`flex h-4.5 min-w-4.5 flex-shrink-0 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ${
                    collapsed ? "md:absolute md:top-1 md:right-1" : ""
                  }`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {collapsed && (
                <span className="pointer-events-none absolute left-full z-50 ml-2 hidden -translate-y-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 md:top-1/2 md:group-hover:block">
                  {label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative border-t border-border px-3 py-4" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className={`group relative flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-slate-50 ${
              collapsed ? "md:justify-center md:px-0" : ""
            }`}
          >
            <UserAvatar name={displayName} profilePicture={user?.profilePicture ?? null} className="h-8 w-8 flex-shrink-0 rounded-full" />
            <div className={`min-w-0 flex-1 text-left ${collapsed ? "md:hidden" : ""}`}>
              <p className="truncate text-xs font-bold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{userTypeLabel(user?.userType ?? null)}</p>
            </div>
            <MoreHorizontal className={`h-4 w-4 flex-shrink-0 text-slate-400 ${collapsed ? "md:hidden" : ""}`} />
            {collapsed && (
              <span className="pointer-events-none absolute left-full z-50 ml-2 hidden -translate-y-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100 md:top-1/2 md:group-hover:block">
                {displayName}
              </span>
            )}
          </button>
          {dropdownOpen && (
            <div
              className={`absolute bottom-full mb-2 w-[190px] rounded-xl border border-border bg-card p-1.5 shadow-lg ${
                collapsed ? "left-full ml-2" : "left-3 right-3 w-auto"
              }`}
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3.5 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button className="cursor-pointer text-slate-500 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <button
              className="hidden h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 md:flex"
              onClick={() => setCollapsed((v) => !v)}
              title="Toggle sidebar"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg leading-tight font-extrabold">{meta.title}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">{meta.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {isBusiness && (
              <Link
                to="/app/qr-code"
                className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary"
                title="Review QR code"
                aria-label="Review QR code"
              >
                <QrCode className="h-[18px] w-[18px]" />
              </Link>
            )}
            <div className="flex items-center gap-2 rounded-xl py-1 pr-3 pl-1">
              <UserAvatar name={displayName} profilePicture={user?.profilePicture ?? null} className="h-7 w-7 rounded-full" />
              <span className="hidden text-xs font-semibold sm:block">{displayName}</span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-50 hover:text-destructive"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
