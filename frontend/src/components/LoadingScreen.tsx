import { Star } from "lucide-react"

// Branded full-page loading state - same rounded-square Star mark used in
// MarketingNav/AppLayout's logo, with a spinning ring around it. Shown by
// PrivateRoute while it's deciding whether a route is reachable, so that
// decision reads as "loading" rather than an instant, jarring snap to
// another page. Frosted-glass background (blurred/translucent), not a flat
// bg-white slab - reads as a soft transition rather than a hard cut,
// especially coming from a dark page like the marketing hero.
export function LoadingScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-white/40 backdrop-blur-2xl">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Star className="h-4 w-4 fill-white text-white" />
        </div>
      </div>
      <p className="text-sm font-medium text-slate-400">Loading...</p>
    </div>
  )
}
