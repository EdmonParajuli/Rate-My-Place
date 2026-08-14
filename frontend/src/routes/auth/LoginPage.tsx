import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Star } from "lucide-react"
import { TestimonialCarousel } from "./TestimonialCarousel"
import { SignInForm } from "./SignInForm"
import { SignUpForm } from "./SignUpForm"

type Tab = "signin" | "signup"

// Variant A from prototype/auth-screens (docs/specs/phase-4-frontend-mvp.md
// §2) - split-screen, dark hero-gradient left panel with a rotating
// testimonial carousel, Sign In/Sign Up tabs on the right.
//
// `?tab=signup` and `?type=regular|business` let the marketing landing
// page's CTAs (dual-path chooser, "Get Started") land here pre-set instead
// of always defaulting to Sign In.
export function LoginPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "signup" ? "signup" : "signin")
  const initialUserType = searchParams.get("type") === "business" ? "BUSINESS" : searchParams.get("type") === "regular" ? "REGULAR" : undefined

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hero-gradient relative hidden flex-col justify-between overflow-hidden p-12 text-white md:flex">
        <div className="relative flex items-center gap-2">
          <div className="rounded-xl bg-white/10 p-2">
            <Star className="h-5 w-5 fill-accent text-accent" />
          </div>
          <span className="text-xl font-bold">Rate My Place</span>
        </div>
        <div className="relative">
          <p className="mb-4 max-w-sm text-3xl font-bold">Join millions finding and reviewing great local places.</p>
          <TestimonialCarousel />
        </div>
        <div className="relative flex gap-8 text-sm text-slate-300">
          <span>
            <strong className="text-white">5M+</strong> Users
          </span>
          <span>
            <strong className="text-white">1.2M</strong> Places
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setTab("signin")}
              className={`flex-1 rounded-[10px] py-2.5 text-center text-sm font-semibold transition-colors ${
                tab === "signin" ? "bg-white text-foreground shadow-sm" : "text-slate-500"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("signup")}
              className={`flex-1 rounded-[10px] py-2.5 text-center text-sm font-semibold transition-colors ${
                tab === "signup" ? "bg-white text-foreground shadow-sm" : "text-slate-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          {tab === "signin" ? <SignInForm /> : <SignUpForm initialUserType={initialUserType} />}
        </div>
      </div>
    </div>
  )
}
