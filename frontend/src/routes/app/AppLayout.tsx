import { useEffect, useRef, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { Star, Search, Grid3x3, MessageSquare, MoreHorizontal, LogOut, Menu, X } from "lucide-react"
import { useAuth } from "@/lib/auth/AuthContext"
import { UserAvatar } from "@/components/UserAvatar"

// Variant A from prototype/authenticated-shell (docs/specs/phase-4-frontend-mvp.md
// §3) - w-60 sidebar holding only the 3 Phase-4 nav items
// (Saved/Notifications/Profile/Settings are fully absent, not locked),
// identical for REGULAR and BUSINESS users. Desktop collapse-to-icon-rail
// toggle with hover tooltips, mobile hamburger + slide-over (the real Figma
// source had zero mobile handling), a working Log out (the source had none).
const NAV_ITEMS = [
  { to: "/app", label: "Discover", icon: Search, end: true },
  { to: "/app/categories", label: "Categories", icon: Grid3x3, end: false },
  { to: "/app/my-reviews", label: "My Reviews", icon: MessageSquare, end: false },
]

const SCREEN_META: Record<string, { title: string; subtitle: string }> = {
  "/app": { title: "Discover Places", subtitle: "Find and explore places near you" },
  "/app/categories": { title: "Categories", subtitle: "Browse places by type" },
  "/app/my-reviews": { title: "My Reviews", subtitle: "All your published reviews" },
}

function userTypeLabel(userType: string | null): string {
  return userType === "BUSINESS" ? "Business owner" : "Reviewer"
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

  const meta = SCREEN_META[location.pathname] ?? SCREEN_META["/app"]
  const displayName = user?.fullName ?? "Account"

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
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
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
              <span className={collapsed ? "md:hidden" : ""}>{label}</span>
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
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-white/95 px-4 py-3.5 backdrop-blur md:px-6">
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
          <div className="flex flex-shrink-0 items-center gap-2 rounded-xl py-1 pr-3 pl-1">
            <UserAvatar name={displayName} profilePicture={user?.profilePicture ?? null} className="h-7 w-7 rounded-full" />
            <span className="hidden text-xs font-semibold sm:block">{displayName}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
