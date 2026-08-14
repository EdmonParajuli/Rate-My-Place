import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Building2, MessageSquare, Search, ShieldCheck, Sparkles, Star, TrendingUp, User } from "lucide-react"
import { TESTIMONIALS } from "@/lib/testimonials"
import { MarketingNav } from "./MarketingNav"
import { MarketingFooter } from "./MarketingFooter"
import { TrendingPlacesStrip } from "./TrendingPlacesStrip"

const STATS = [
  { value: "5M+", label: "Active Users" },
  { value: "1.2M", label: "Places Listed" },
  { value: "10M+", label: "Reviews Shared" },
  { value: "98%", label: "Satisfaction" },
]

const CATEGORY_CHIPS = ["🍽️ Restaurants", "☕ Cafés", "🏨 Hotels", "💪 Fitness"]

const FEATURES = [
  { icon: MessageSquare, colorClass: "bg-blue-50 text-primary", title: "Give ratings & reviews", desc: "Share honest experiences with the community." },
  { icon: TrendingUp, colorClass: "bg-emerald-50 text-emerald-600", title: "Monitor your reputation", desc: "Track ratings and respond to feedback." },
  { icon: ShieldCheck, colorClass: "bg-amber-50 text-amber-600", title: "Verified opinions", desc: "Reviews you can actually trust." },
]

// Variant B from prototype/marketing-landing-page (docs/specs/phase-4-frontend-mvp.md
// §1) - dark-gradient hero with the stats strip embedded in it, a dual-path
// reviewer/business chooser as the primary affordance below the hero, a real
// (not mock) horizontal-scroll trending-places strip, condensed feature copy,
// a CTA banner reusing the hero gradient, shared footer. Fully static/
// logged-out - no GraphQL on load besides the trending strip's own query.
export function HomePage() {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate("/app")
  }

  return (
    <div className="min-h-svh bg-white text-slate-900">
      <MarketingNav />

      <div className="hero-gradient relative overflow-hidden pt-20 pb-16">
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-200">
            <Sparkles className="h-4 w-4 text-accent" />
            Trusted by millions of local reviewers
          </span>
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-6xl">
            Find it. Review it.
            <br />
            <span className="bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">Help it grow.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300">
            The reviews marketplace connecting reviewers and local businesses.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mb-6 flex max-w-2xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-2xl md:flex-row">
            <div className="flex flex-1 items-center rounded-xl bg-slate-50 px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search places..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
              />
            </div>
            <button type="submit" className="rounded-xl bg-primary px-6 py-3 font-medium text-white hover:bg-blue-700">
              Search
            </button>
          </form>
          <div className="mb-14 flex flex-wrap justify-center gap-2">
            {CATEGORY_CHIPS.map((chip) => (
              <span key={chip} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white">
                {chip}
              </span>
            ))}
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white md:text-4xl">{stat.value}</div>
                <div className="text-xs text-slate-400 md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            to="/login?tab=signup&type=regular"
            className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-8 transition-colors hover:border-primary"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <User className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold">I'm here to review</h3>
            <p className="mb-4 text-sm text-slate-600">Discover local places, share honest reviews, and save your favorites.</p>
            <span className="flex items-center gap-1 text-sm font-medium text-primary">
              Get started <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link
            to="/login?tab=signup&type=business"
            className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-8 transition-colors hover:border-emerald-500"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold">I run a business</h3>
            <p className="mb-4 text-sm text-slate-600">Claim your listing, respond to reviews, and grow your reputation.</p>
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              Claim your place <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Trending near you</h2>
            <span className="text-sm text-slate-500">Scroll for more →</span>
          </div>
          <TrendingPlacesStrip />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-100 p-6">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${feature.colorClass}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h4 className="mb-1 font-bold">{feature.title}</h4>
              <p className="text-sm text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-10 text-center text-2xl font-bold">What people are saying</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.author} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/50">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="mb-6 text-sm text-slate-700 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  <p className="text-sm font-bold">{testimonial.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 text-center">
        <div className="hero-gradient relative rounded-3xl p-12">
          <div className="relative">
            <h2 className="mb-3 text-3xl font-bold text-white">Ready to get started?</h2>
            <p className="mb-6 text-slate-300">Join millions finding and reviewing great local places.</p>
            <Link
              to="/login?tab=signup"
              className="inline-block rounded-xl bg-accent px-8 py-3 font-bold text-slate-900 hover:brightness-95"
            >
              Create your free account
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
