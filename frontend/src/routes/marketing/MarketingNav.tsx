import { Link } from "react-router-dom"
import { Star } from "lucide-react"

export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-primary p-2">
            <Star className="h-5 w-5 fill-accent text-accent" />
          </div>
          <span className="text-xl font-bold text-white">
            Rate My <span className="text-blue-400">Place</span>
          </span>
        </Link>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white">
            Sign In
          </Link>
          <Link to="/login?tab=signup" className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-slate-900 hover:brightness-95">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}
