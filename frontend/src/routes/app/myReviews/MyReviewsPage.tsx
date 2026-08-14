import { useState } from "react"
import { MessageSquare } from "lucide-react"
import {
  useMyReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from "@/lib/graphql/generated/graphql"
import { deleteDraft, getDrafts, updateDraft, type ReviewDraft } from "@/lib/drafts"
import { StatsRow } from "./StatsRow"
import { MostHelpfulBanner } from "./MostHelpfulBanner"
import { ReviewListItem } from "./ReviewListItem"
import { DraftCard } from "./DraftCard"
import type { MyReview } from "./types"

type Tab = "published" | "drafts"

export function MyReviewsPage() {
  const [tab, setTab] = useState<Tab>("published")
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [drafts, setDrafts] = useState<ReviewDraft[]>(() => getDrafts())

  const { data, loading, refetch } = useMyReviewsQuery({ variables: { first: 50 } })
  const [updateReview] = useUpdateReviewMutation()
  const [deleteReview] = useDeleteReviewMutation()

  const reviews = (data?.myReviews?.data ?? []).filter((r): r is MyReview => r !== null)

  const totalReviews = reviews.length
  const helpfulVotes = reviews.reduce((sum, r) => sum + (r.helpfulCount ?? 0), 0)
  const businesses = new Set(reviews.map((r) => r.place?.id).filter((id) => id !== null && id !== undefined)).size
  const mostHelpful = reviews.reduce<MyReview | null>((best, r) => ((r.helpfulCount ?? 0) > (best?.helpfulCount ?? 0) ? r : best), null)

  const handleSaveEdit = async (reviewId: number, rating: number, text: string) => {
    setSubmitting(true)
    try {
      await updateReview({ variables: { reviewId, input: { review: text, rating } } })
      setEditingReviewId(null)
      await refetch()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Delete your review? This can't be undone.")) return
    await deleteReview({ variables: { reviewId } })
    await refetch()
  }

  const handleContinueDraft = (id: string, rating: number, text: string) => {
    updateDraft(id, { rating, text })
    setDrafts(getDrafts())
  }

  const handleDeleteDraft = (id: string) => {
    if (!confirm("Delete this draft?")) return
    deleteDraft(id)
    setDrafts(getDrafts())
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-6">
      <h1 className="text-2xl font-extrabold">My Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage the reviews you've written and pick up where you left off on drafts.</p>

      <div className="mt-5">
        <StatsRow totalReviews={totalReviews} helpfulVotes={helpfulVotes} businesses={businesses} />
      </div>

      {mostHelpful && (
        <div className="mt-4">
          <MostHelpfulBanner review={mostHelpful} />
        </div>
      )}

      <div className="mt-6 flex items-center gap-1 rounded-lg bg-slate-100 p-0.5" style={{ width: "fit-content" }}>
        <button
          onClick={() => setTab("published")}
          className={`rounded-md px-4 py-1.5 text-xs font-semibold ${tab === "published" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Published ({totalReviews})
        </button>
        <button
          onClick={() => setTab("drafts")}
          className={`rounded-md px-4 py-1.5 text-xs font-semibold ${tab === "drafts" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
          Drafts ({drafts.length})
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {tab === "published" ? (
          loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading your reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
              <MessageSquare className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No reviews yet</p>
              <p className="text-xs text-muted-foreground">Reviews you write will show up here.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewListItem
                key={review.id}
                review={review}
                isEditing={editingReviewId === review.id}
                submitting={submitting}
                onStartEdit={() => setEditingReviewId(review.id ?? null)}
                onCancelEdit={() => setEditingReviewId(null)}
                onSaveEdit={(rating, text) => review.id && handleSaveEdit(review.id, rating, text)}
                onDelete={() => review.id && handleDelete(review.id)}
              />
            ))
          )
        ) : drafts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
            <MessageSquare className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No drafts saved</p>
            <p className="text-xs text-muted-foreground">Save a review as a draft from any place page to continue it later.</p>
          </div>
        ) : (
          drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onContinue={(rating, text) => handleContinueDraft(draft.id, rating, text)}
              onDelete={() => handleDeleteDraft(draft.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
