import { useState } from "react"
import { Clock, CornerDownRight, Edit3, MessageCircle, Send, Star, ThumbsUp, Trash2 } from "lucide-react"
import { UserAvatar } from "@/components/UserAvatar"
import { ReviewPhotoStrip } from "@/components/ReviewPhotoStrip"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/formatDate"
import type { PlaceReview } from "./types"

export function ReviewCard({
  review,
  isMine,
  isOwnerViewing,
  ownerName,
  onEdit,
  onDelete,
  onToggleHelpful,
  onSubmitReply,
}: {
  review: PlaceReview
  isMine: boolean
  isOwnerViewing: boolean
  ownerName: string | null | undefined
  onEdit: () => void
  onDelete: () => void
  onToggleHelpful: () => void
  onSubmitReply: (text: string) => Promise<void>
}) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return
    setSubmittingReply(true)
    try {
      await onSubmitReply(replyText)
      setReplyOpen(false)
      setReplyText("")
    } finally {
      setSubmittingReply(false)
    }
  }

  return (
    <div className="p-5">
      <div className="mb-3 flex items-start gap-3">
        <UserAvatar name={review.reviewer?.fullName ?? "?"} profilePicture={review.reviewer?.profilePicture} className="h-10 w-10 flex-shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold">{review.reviewer?.fullName}</p>
            {isMine && <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-primary">You</span>}
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < (review.rating ?? 0) ? "fill-accent text-accent" : "fill-slate-200 text-slate-200"}`} />
              ))}
            </div>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
        {isMine && !isOwnerViewing && (
          <div className="flex flex-shrink-0 items-center gap-1">
            <button onClick={onEdit} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-primary">
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <p className="mb-3 text-sm leading-relaxed text-slate-600">{review.review}</p>

      {review.id != null && <ReviewPhotoStrip reviewId={review.id} photoCount={review.photoCount} />}

      {!isOwnerViewing && (
        <button
          onClick={onToggleHelpful}
          disabled={isMine}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
            isMine ? "cursor-not-allowed" : "cursor-pointer"
          } ${
            review.helpfulByMe
              ? "border-primary/20 bg-primary/5 text-primary"
              : isMine
                ? "border-slate-100 text-slate-300"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <ThumbsUp className={`h-3.5 w-3.5 ${review.helpfulByMe ? "fill-primary" : ""}`} />
          Helpful ({review.helpfulCount ?? 0})
        </button>
      )}

      {review.reply && (
        <div className="relative mt-3 ml-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <CornerDownRight className="absolute -left-3 top-5 h-4 w-4 text-slate-300" />
          <div className="mb-2 flex items-center gap-2.5">
            <UserAvatar name={ownerName ?? "?"} className="h-8 w-8 flex-shrink-0 rounded-full" />
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-slate-800">{ownerName}</p>
              <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Owner</span>
              <span className="text-xs text-slate-400">{formatDate(review.reply.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">{review.reply.description}</p>
        </div>
      )}

      {isOwnerViewing && !review.reply && (
        <div className="mt-3 ml-6">
          {replyOpen ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Replying as {ownerName}</span>
                <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Owner</span>
              </div>
              <textarea
                className="w-full rounded-[10px] border border-border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
                rows={3}
                placeholder="Write a public reply…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="mt-3 flex items-center justify-between">
                <Button type="button" variant="ghost" size="sm" onClick={() => setReplyOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" size="sm" disabled={!replyText.trim() || submittingReply} onClick={handleSubmitReply}>
                  <Send className="h-3.5 w-3.5" />
                  {submittingReply ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setReplyOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Reply to this review
            </button>
          )}
        </div>
      )}
    </div>
  )
}
