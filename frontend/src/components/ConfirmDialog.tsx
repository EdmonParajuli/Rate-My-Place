import { useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"

// Generic destructive-action confirm modal, styled after the Danger Zone's
// existing Cancel/Delete button pair (RegularSettingsPage.tsx) rather than
// introducing a new visual pattern. Replaces bare window.confirm() calls
// (MyReviewsPage's review/draft delete, PlaceDetailPage's review delete -
// report.md edge case 3.5): those were inconsistent with the rest of the
// app's confirmation UX and, worse, a real testing blind spot - a native
// confirm() dialog can't be dismissed through browser automation tooling
// and leaves the tab stuck. Dismissable like any other modal in this app
// (backdrop, Escape, close button), unlike ScanAuthModal's intentional
// mandatory gate - there's nothing to gate here, just a mistake to avoid.
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-start gap-3 pr-6">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-rose-50">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 cursor-pointer rounded-xl bg-rose-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
