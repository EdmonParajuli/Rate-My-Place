import { Star } from "lucide-react"

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 pt-12 pb-8">
      <div className="mx-auto mb-10 grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
        <div className="col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5">
              <Star className="h-4 w-4 fill-accent text-accent" />
            </div>
            <span className="font-bold">Rate My Place</span>
          </div>
          <p className="max-w-sm text-sm text-slate-500">
            Empowering communities and helping local places grow through honest reviews.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">For Users</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>Write a Review</li>
            <li>Search Places</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold">For Businesses</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li>Claim your Place</li>
            <li>Dashboard</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-slate-200 px-6 pt-6 text-center text-sm text-slate-500">
        © 2026 Rate My Place. All rights reserved.
      </div>
    </footer>
  )
}
