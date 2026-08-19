import { useState } from "react"
import { Link } from "react-router-dom"
import { Check as CheckIcon, Clock, Edit3, MapPin, Share2, Star, ThumbsUp, Trash2 } from "lucide-react"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import { ReviewPhotoStrip } from "@/components/ReviewPhotoStrip"
import { formatDate } from "@/lib/formatDate"
import type { MyReview } from "./types"

export function ReviewListItem({
  review,
  isEditing,
  submitting,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: {
  review: MyReview
  isEditing: boolean
  submitting: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: (rating: number, text: string) => void
  onDelete: () => void
}) {
  const [editRating, setEditRating] = useState(review.rating ?? 0)
  const [editText, setEditText] = useState(review.review ?? "")
  const [copied, setCopied] = useState(false)
  const style = review.place?.category?.label ? CATEGORY_STYLES[review.place.category.label] : undefined

  const handleShare = async () => {
    const url = `${window.location.origin}/app/places/${review.place?.id}`
    if (navigator.share) {
      await navigator.share({ title: review.place?.label ?? "Rate My Place", url }).catch(() => undefined)
      return
    }
    await navigator.clipboard.writeText(url).catch(() => undefined)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4 p-5">
        <Link
          to={`/app/places/${review.place?.id}`}
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${style?.gradient ?? "from-slate-300 to-slate-400"}`}
        >
          {review.place?.profilePicture ? (
            <img src={review.place.profilePicture} alt="" className="h-full w-full object-cover" />
          ) : (
            <MapPin className="h-5 w-5 text-white/70" />
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/app/places/${review.place?.id}`} className="text-sm font-bold hover:text-primary">
                {review.place?.label}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < (review.rating ?? 0) ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
                  ))}
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <button onClick={onStartEdit} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-blue-50 hover:text-primary">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={handleShare} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                {copied ? <CheckIcon className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              </button>
              <button onClick={onDelete} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="mb-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setEditRating(n)} className="cursor-pointer">
                    <Star className={`h-5 w-5 cursor-pointer ${n <= editRating ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded-[10px] border border-border p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onSaveEdit(editRating, editText)}
                  disabled={!editRating || !editText.trim() || submitting}
                  className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save changes"}
                </button>
                <button onClick={onCancelEdit} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.review}</p>
          )}

          {!isEditing && review.id != null && <ReviewPhotoStrip reviewId={review.id} photoCount={review.photoCount} />}

          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-semibold text-emerald-600">{review.helpfulCount ?? 0} people</span> found this helpful
          </div>
        </div>
      </div>
    </div>
  )
}
