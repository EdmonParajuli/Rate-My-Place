import { useState } from "react"
import { Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

const RATING_LABEL: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Great", 5: "Excellent" }

export function WriteReviewForm({
  placeName,
  initialRating,
  initialText,
  isEditing,
  submitting,
  onCancel,
  onSubmit,
}: {
  placeName: string | null | undefined
  initialRating?: number
  initialText?: string
  isEditing: boolean
  submitting: boolean
  onCancel: () => void
  onSubmit: (rating: number, text: string) => void
}) {
  const [rating, setRating] = useState(initialRating ?? 0)
  const [text, setText] = useState(initialText ?? "")

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card p-5">
      <h2 className="mb-1 font-bold">{isEditing ? "Edit Your Review" : "Write a Review"}</h2>
      <p className="mb-4 text-xs text-muted-foreground">Share your honest experience with {placeName}.</p>
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">Your Rating</p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}>
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
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={!rating || !text.trim() || submitting} onClick={() => onSubmit(rating, text)}>
          <Send className="h-4 w-4" />
          {submitting ? "Saving..." : isEditing ? "Save Changes" : "Submit Review"}
        </Button>
      </div>
    </div>
  )
}
