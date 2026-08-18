import { useState } from "react"
import { Star, Send, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReviewPhotosSection } from "./ReviewPhotosSection"
import { PendingPhotosPicker, type PendingPhoto } from "./PendingPhotosPicker"

const RATING_LABEL: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" }

type GalleryPhoto = { id?: number | null; url?: string | null }

export function WriteReviewForm({
  placeName,
  initialRating,
  initialText,
  isEditing,
  reviewId,
  photos,
  submitting,
  onCancel,
  onSubmit,
  onSaveDraft,
  onPhotosChanged,
}: {
  placeName: string | null | undefined
  initialRating?: number
  initialText?: string
  isEditing: boolean
  // Only present while editing an existing (already-created) review -
  // ReviewPhotosSection's upload needs a real review to attach to. A
  // not-yet-submitted review instead collects photos locally via
  // PendingPhotosPicker below, uploaded once the caller's onSubmit has a
  // real id (see PlaceDetailPage.handleSubmitReview).
  reviewId?: number | null
  photos?: GalleryPhoto[]
  submitting: boolean
  onCancel: () => void
  onSubmit: (rating: number, text: string, photos: File[]) => void
  // Not offered while editing a published review - drafts are only for a
  // review that hasn't been submitted yet (docs/specs/phase-4-frontend-mvp.md
  // §7's My Reviews resolution: a real but client-side-only, this-device-only
  // feature, never sent to the API). Picked photos aren't carried into a
  // draft - localStorage can't hold File objects and a draft has no reviewId
  // to eventually attach them to anyway.
  onSaveDraft?: (rating: number, text: string) => void
  onPhotosChanged?: () => void
}) {
  const [rating, setRating] = useState(initialRating ?? 0)
  const [text, setText] = useState(initialText ?? "")
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([])

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card p-5">
      <h2 className="mb-1 font-bold">{isEditing ? "Edit Your Review" : "Write a Review"}</h2>
      <p className="mb-4 text-xs text-muted-foreground">Share your honest experience with {placeName}.</p>
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">Your Rating</p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="cursor-pointer">
                <Star className={`h-6 w-6 cursor-pointer ${n <= rating ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
              </button>
            ))}
          </div>
          {rating > 0 && <span className="text-sm font-bold text-amber-600">{RATING_LABEL[rating]}</span>}
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">Your Review</p>
        <textarea
          className="field w-full rounded-[10px] border border-border p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
          rows={4}
          placeholder="What did you love (or not love)?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {isEditing && reviewId ? (
        <ReviewPhotosSection reviewId={reviewId} photos={photos ?? []} onChanged={onPhotosChanged ?? (() => {})} />
      ) : (
        !isEditing && <PendingPhotosPicker photos={pendingPhotos} onChange={setPendingPhotos} />
      )}

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <Button type="button" variant="outline" disabled={!rating || !text.trim()} onClick={() => onSaveDraft(rating, text)}>
              <FileText className="h-4 w-4" />
              Save as Draft
            </Button>
          )}
          <Button
            type="button"
            disabled={!rating || !text.trim() || submitting}
            onClick={() => onSubmit(rating, text, pendingPhotos.map((p) => p.file))}
          >
            <Send className="h-4 w-4" />
            {submitting ? "Saving..." : isEditing ? "Save Changes" : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  )
}
