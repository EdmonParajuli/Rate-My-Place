import { useState } from "react"
import { Star } from "lucide-react"
import { SignInForm } from "@/routes/auth/SignInForm"
import { SignUpForm } from "@/routes/auth/SignUpForm"

type Tab = "signin" | "signup"

// The QR scan flow's mandatory auth gate (docs/specs/phase-11-qr-review-flow.md,
// ticket 03, Q7's decision): the customer lands directly on the real review
// page, dimmed behind this overlay, and can't interact with anything until
// they sign up or log in. Deliberately non-dismissable - no backdrop click,
// no close button, no Escape handler - so there's simply nothing wired up to
// close it early. onSuccess is passed through to SignInForm/SignUpForm as a
// no-op: it only needs to exist so those forms skip their default
// post-auth navigate() - AuthContext's user state flipping truthy is what
// actually clears this modal, via the caller's own render condition.
export function ScanAuthModal({ placeName }: { placeName: string | null | undefined }) {
  const [tab, setTab] = useState<Tab>("signin")

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Sign in to review ${placeName ?? "this place"}`}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
            <Star className="h-4 w-4 fill-white text-white" />
          </div>
          <span className="text-lg font-extrabold">Rate My Place</span>
        </div>
        <p className="mb-5 text-sm text-slate-600">
          Sign in or create an account to review <span className="font-semibold text-slate-800">{placeName ?? "this place"}</span>.
        </p>
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 cursor-pointer rounded-[10px] py-2.5 text-center text-sm font-semibold transition-colors ${
              tab === "signin" ? "bg-white text-foreground shadow-sm" : "text-slate-500"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 cursor-pointer rounded-[10px] py-2.5 text-center text-sm font-semibold transition-colors ${
              tab === "signup" ? "bg-white text-foreground shadow-sm" : "text-slate-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {tab === "signin" ? <SignInForm onSuccess={() => {}} /> : <SignUpForm onSuccess={() => {}} />}
      </div>
    </div>
  )
}
