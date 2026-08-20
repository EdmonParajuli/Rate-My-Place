import { useRef, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Check, Copy, Download, QrCode as QrCodeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMyReviewQrCodeQuery } from "@/lib/graphql/generated/graphql"

// Print-size default, not a UI-driven setting - this page has no size
// picker in V1. "Q" (25% error correction) over the library's "M" default
// since this is meant to end up printed on a sticker/table tent handling
// real wear (grease, glare, folds), not just displayed on a screen.
const QR_PIXEL_SIZE = 320

export function QrCodePage() {
  const { data, loading, error } = useMyReviewQrCodeQuery()
  const qrWrapperRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const token = data?.myReviewQrCode?.data?.publicToken
  // Composed client-side from the plaintext token (Q3) - nothing server-side
  // needs to know its own domain, matching docs/specs/phase-11-qr-review-flow.md.
  const reviewUrl = token ? `${window.location.origin}/r/${token}` : null

  const handleDownload = () => {
    const canvas = qrWrapperRef.current?.querySelector("canvas")
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "rate-my-place-review-qr.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const handleCopy = async () => {
    if (!reviewUrl) return
    await navigator.clipboard.writeText(reviewUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading your QR code...</p>
  }

  if (error || !reviewUrl) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-700">Couldn't load your QR code</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {error?.message ?? "You don't have a listing yet."}
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-12">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
          <QrCodeIcon className="h-6 w-6 text-primary" />
          Review QR Code
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Print this and put it where customers will see it — scanning it takes them straight to your review form,
          no searching required.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div ref={qrWrapperRef} className="mx-auto mb-6 inline-flex rounded-2xl border border-slate-100 bg-white p-5">
          <QRCodeCanvas value={reviewUrl} size={QR_PIXEL_SIZE} level="Q" />
        </div>

        <div className="mb-5 rounded-xl bg-slate-50 px-4 py-2.5">
          <p className="truncate text-xs font-medium text-slate-600">{reviewUrl}</p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button type="button" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button type="button" variant="outline" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </div>
    </div>
  )
}
