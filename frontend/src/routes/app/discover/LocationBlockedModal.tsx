import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

// The map view (edge case 3.3) is gated on real browser geolocation - see
// DiscoverPage.handleShowMap. This is what a user sees if they deny (or
// have already denied) that permission: unlike ScanAuthModal's mandatory
// auth gate, this blocks a nice-to-have view rather than a core flow, so
// it's dismissable (backdrop, Escape, close button) - the user just stays
// on the list view.
export function LocationBlockedModal({
  onRetry,
  onClose,
  retrying,
  error,
}: {
  onRetry: () => void
  onClose: () => void
  retrying: boolean
  error: string | null
}) {
  // error already holds the reason this modal opened (the denial that
  // triggered it) - shown up front, that reads as "here's what's wrong."
  // Only surface it once the user has actually clicked "Turn On Location"
  // in here, so a failed retry doesn't look like a silent no-op, without
  // immediately front-loading the same message the modal opened with.
  const [hasRetried, setHasRetried] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleRetry = () => {
    setHasRetried(true)
    onRetry()
  }

  // A retry that still comes back with an error means the browser is
  // refusing to re-open its permission prompt (see useGeolocation) - more
  // clicks can't change that outcome, only the browser's own site settings
  // can, so keep the button from inviting a pointless third/fourth click.
  const blocked = hasRetried && Boolean(error)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Location required"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-5xl">
          <span aria-hidden="true">👧</span>
          <span
            aria-hidden="true"
            className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-base"
          >
            😕
          </span>
        </div>

        <h2 className="mb-1.5 text-lg font-extrabold text-slate-800">Oops! You need to turn on the location to use this feature</h2>
        <div className="mb-5 space-y-2">
          <p className="text-sm text-slate-500">
            Map view centers on where you are - allow location access in your browser, then try again.
          </p>
          {/* Once a browser's location permission is explicitly denied, a
              retry click can't re-open that prompt - it just fails again
              with no visible change unless we surface why (see
              useGeolocation's PERMISSION_DENIED-specific message), so this
              is the only thing that keeps "Turn On Location" from looking
              like a no-op. */}
          {hasRetried && error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">{error}</p>}
        </div>

        <div className="flex flex-col gap-2">
          {/* Button's base disabled styling pairs disabled:cursor-not-allowed
              with disabled:pointer-events-none - the latter stops the
              browser from ever treating this element as hovered, so the
              not-allowed cursor never actually renders. Re-enabling pointer
              events here is safe: the native `disabled` attribute already
              blocks the click/keyboard activation on its own. */}
          <Button onClick={handleRetry} disabled={retrying || blocked} className="w-full disabled:pointer-events-auto">
            {retrying ? "Checking..." : blocked ? "Location Blocked" : "Turn On Location"}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  )
}
