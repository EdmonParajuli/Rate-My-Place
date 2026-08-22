import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"
import { SignInForm } from "@/routes/auth/SignInForm"
import { SignUpForm } from "@/routes/auth/SignUpForm"

type Tab = "signin" | "signup"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

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
  const panelRef = useRef<HTMLDivElement>(null)

  // Edge case 3.2: the backdrop blocks mouse interaction, but a keyboard or
  // screen-reader user could otherwise Tab straight through it into the
  // dimmed review form underneath. The page marks its own content `inert`
  // while this is mounted (see PlaceDetailPage), which handles screen-reader
  // virtual-cursor navigation; this effect additionally traps Tab/Shift+Tab
  // inside the panel and moves initial focus into it, since wrap-around
  // behavior at the start/end of the tab order otherwise falls to the
  // browser rather than looping back into the modal.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current
      if (event.key !== "Tab" || !panel) return
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!active || !panel.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Sign in to review ${placeName ?? "this place"}`}
    >
      <div ref={panelRef} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
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

        {tab === "signin" ? <SignInForm onSuccess={() => {}} /> : <SignUpForm onSuccess={() => {}} restrictToRegular />}
      </div>
    </div>
  )
}
