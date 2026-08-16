import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  Check,
  Clock,
  Edit3,
  Globe,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/UserAvatar"
import { SaveHeartButton } from "@/components/SaveHeartButton"
import { useAuth } from "@/lib/auth/AuthContext"
import {
  useGetPlaceByIdQuery,
  usePlaceReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleHelpfulVoteMutation,
  useCreateReviewReplyMutation,
  useListPlacesQuery,
  type ReviewSortEnum,
} from "@/lib/graphql/generated/graphql"
import { saveDraft } from "@/lib/drafts"
import { RatingOverview } from "./RatingOverview"
import { WriteReviewForm } from "./WriteReviewForm"
import { ReviewCard } from "./ReviewCard"
import { dayName, formatTime, sortByDay } from "./formatHours"
import type { PlaceReview } from "./types"

const PRICE_SYMBOL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" }
const SORTS: { value: ReviewSortEnum; label: string }[] = [
  { value: "RECENT", label: "Most Recent" },
  { value: "HELPFUL", label: "Most Helpful" },
]

export function PlaceDetailPage() {
  const { placeId } = useParams<{ placeId: string }>()
  const id = Number(placeId)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sort, setSort] = useState<ReviewSortEnum>("RECENT")
  const [hoursOpen, setHoursOpen] = useState(false)
  const [writeFormOpen, setWriteFormOpen] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const { data: placeData, loading: placeLoading, refetch: refetchPlace } = useGetPlaceByIdQuery({ variables: { id } })
  const place = placeData?.getPlaceById?.data

  const { data: reviewsData, refetch: refetchReviews } = usePlaceReviewsQuery({ variables: { placeId: id, first: 20, sort } })
  const reviews = (reviewsData?.placeReviews?.data ?? []).filter((r): r is PlaceReview => r !== null)

  const { data: similarData } = useListPlacesQuery({
    variables: { filter: { categoryId: place?.category?.id ?? undefined }, first: 4 },
    skip: !place?.category?.id,
  })
  const similarPlaces = (similarData?.listPlaces?.data ?? []).filter((p) => p !== null && p.id !== id).slice(0, 3)

  const [createReview] = useCreateReviewMutation()
  const [updateReview] = useUpdateReviewMutation()
  const [deleteReview] = useDeleteReviewMutation()
  const [toggleHelpfulVote] = useToggleHelpfulVoteMutation()
  const [createReviewReply] = useCreateReviewReplyMutation()

  const refetchAll = () => Promise.all([refetchPlace(), refetchReviews()])

  if (placeLoading) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading place...</p>
  }
  if (!place) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-700">Place not found</p>
        <Link to="/app" className="mt-2 inline-block text-sm text-primary">
          Back to Discover
        </Link>
      </div>
    )
  }

  const isOwner = Boolean(user && place.owner?.id === user.id)
  const myReview = user ? reviews.find((r) => r.reviewerId === user.id) : undefined
  const editingReview = editingReviewId ? reviews.find((r) => r.id === editingReviewId) : undefined

  const openWriteForm = () => {
    setEditingReviewId(null)
    setWriteFormOpen(true)
  }
  const openEditForm = () => {
    if (!myReview?.id) return
    setEditingReviewId(myReview.id)
    setWriteFormOpen(true)
  }
  const cancelWriteForm = () => {
    setWriteFormOpen(false)
    setEditingReviewId(null)
    setReviewError(null)
  }

  const handleSaveDraft = (rating: number, text: string) => {
    saveDraft({ placeId: id, placeName: place?.label ?? "this place", rating, text })
    setWriteFormOpen(false)
  }

  const handleSubmitReview = async (rating: number, text: string) => {
    setReviewError(null)
    setSubmittingReview(true)
    try {
      if (editingReview?.id) {
        await updateReview({ variables: { reviewId: editingReview.id, input: { review: text, rating } } })
      } else {
        await createReview({ variables: { placeId: id, input: { review: text, rating } } })
      }
      setWriteFormOpen(false)
      setEditingReviewId(null)
      await refetchAll()
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Delete your review? This can't be undone.")) return
    await deleteReview({ variables: { reviewId } })
    await refetchAll()
  }

  const handleToggleHelpful = async (reviewId: number) => {
    await toggleHelpfulVote({ variables: { reviewId } })
    await refetchReviews()
  }

  const handleSubmitReply = async (reviewId: number, text: string) => {
    await createReviewReply({ variables: { reviewId, input: { description: text } } })
    await refetchReviews()
  }

  const sortedHours = place.hours ? sortByDay(place.hours.filter((h) => h !== null)) : []
  const priceSymbol = place.priceRange ? PRICE_SYMBOL[place.priceRange] : null

  return (
    <div>
      <div className="relative flex h-64 items-center justify-center overflow-hidden bg-[repeating-linear-gradient(45deg,#F1F5F9,#F1F5F9_10px,#E2E8F0_10px,#E2E8F0_20px)] text-slate-400">
        {place.coverPhotoUrl ? (
          <img src={place.coverPhotoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <ImageIcon className="mx-auto mb-1 h-10 w-10" />
            <p className="text-xs font-semibold">Cover photo — Phase 8 Media</p>
          </div>
        )}
        <div className="absolute top-4 right-0 left-0 flex items-center justify-between px-6">
          <button
            onClick={() => navigate("/app")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          {isOwner ? (
            <span className="rounded-xl border border-white/20 bg-amber-500/90 px-3 py-2 text-xs font-bold text-white backdrop-blur-sm">Owner view</span>
          ) : (
            place.id !== null && place.id !== undefined && <SaveHeartButton placeId={place.id} initialSaved={place.savedByMe} />
          )}
        </div>
        {place.openNow !== null && place.openNow !== undefined && (
          <div className="absolute right-6 bottom-4">
            <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-white ${place.openNow ? "border-emerald-400 bg-emerald-500" : "border-slate-500 bg-slate-600"}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {place.openNow ? "Open now" : "Closed"}
            </span>
          </div>
        )}
      </div>

      <div className="border-b border-border bg-card px-6 pt-6 pb-5">
        {isOwner && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <BadgeCheck className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800">You're viewing your own listing</p>
              <p className="mt-0.5 text-xs text-amber-600">Owners can reply to reviews but can't write a review for their own business.</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold">{place.label}</h1>
              {place.isVerified && (
                <span className="flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              {place.category?.label && <span className="font-semibold text-slate-600">{place.category.label}</span>}
              {priceSymbol && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-bold text-slate-600">{priceSymbol}</span>
                </>
              )}
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-extrabold">{(place.averageRating ?? 0).toFixed(1)}</span>
                <span className="text-slate-500">({(place.reviewCount ?? 0).toLocaleString()} reviews)</span>
              </span>
            </div>
            {place.description && <p className="mb-4 max-w-2xl text-sm leading-relaxed text-slate-600">{place.description}</p>}
            <div className="mb-3 flex flex-col gap-x-6 gap-y-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap">
              {place.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {place.address}
                </span>
              )}
              {place.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {place.phone}
                </span>
              )}
              {place.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-slate-400" />
                  {place.website}
                </span>
              )}
            </div>
            {sortedHours.length > 0 && (
              <div>
                <button onClick={() => setHoursOpen((v) => !v)} className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-primary">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Hours
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${hoursOpen ? "rotate-180" : ""}`} />
                </button>
                {hoursOpen && (
                  <div className="mt-2 ml-6 space-y-1">
                    {sortedHours.map((h) => (
                      <div key={h.dayOfWeek} className="flex gap-4 text-xs text-slate-600">
                        <span className="w-24 font-semibold">{dayName(h.dayOfWeek ?? 0)}</span>
                        <span>
                          {formatTime(h.opensAt)} – {formatTime(h.closesAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-shrink-0 flex-col items-start gap-2 lg:items-end">
            {isOwner ? (
              <Button variant="outline">
                <Settings className="h-4 w-4" />
                Manage Listing
              </Button>
            ) : myReview && !writeFormOpen ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600">
                <Check className="h-3.5 w-3.5" />
                You've reviewed this place
              </div>
            ) : !writeFormOpen ? (
              <Button onClick={openWriteForm}>
                <Edit3 className="h-4 w-4" />
                Write a Review
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex max-w-6xl flex-col gap-6 px-6 py-6 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="mb-4 font-bold">Rating Overview</h2>
            <RatingOverview place={place} />
          </div>

          {isOwner ? (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4 flex-shrink-0 text-slate-400" />
              Business owners can't write reviews for their own listing. Reply to reviews below instead.
            </div>
          ) : writeFormOpen ? (
            <>
              <WriteReviewForm
                placeName={place.label}
                initialRating={editingReview?.rating ?? undefined}
                initialText={editingReview?.review ?? undefined}
                isEditing={Boolean(editingReview)}
                submitting={submittingReview}
                onCancel={cancelWriteForm}
                onSubmit={handleSubmitReview}
                onSaveDraft={editingReview ? undefined : handleSaveDraft}
              />
              {reviewError && <p className="text-xs text-destructive">{reviewError}</p>}
            </>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold">{(place.reviewCount ?? reviews.length).toLocaleString()} Reviews</h2>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
                {SORTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSort(s.value)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold ${sort === s.value ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <p className="p-5 text-center text-sm text-muted-foreground">No reviews yet.</p>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    isMine={review.reviewerId === user?.id}
                    isOwnerViewing={isOwner}
                    ownerName={place.owner?.fullName}
                    onEdit={openEditForm}
                    onDelete={() => review.id && handleDeleteReview(review.id)}
                    onToggleHelpful={() => review.id && handleToggleHelpful(review.id)}
                    onSubmitReply={(text) => (review.id ? handleSubmitReply(review.id, text) : Promise.resolve())}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex-shrink-0 space-y-4 lg:w-72">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 text-sm font-bold">Place Info</h3>
            <div className="space-y-3 text-xs text-slate-600">
              {place.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  {place.address}
                </div>
              )}
              {place.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  {place.phone}
                </div>
              )}
              {sortedHours.length > 0 && (
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  {place.openNow ? "Open now" : "Closed"}
                </div>
              )}
            </div>
          </div>

          {similarPlaces.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-bold">Similar Places Nearby</h3>
              <div className="space-y-3">
                {similarPlaces.map((p) => (
                  <Link key={p!.id} to={`/app/places/${p!.id}`} className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <MapPin className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{p!.label}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="text-xs text-muted-foreground">{(p!.averageRating ?? 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {place.owner && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 text-sm font-bold">About the Owner</h3>
              <div className="flex items-center gap-3">
                <UserAvatar name={place.owner.fullName ?? "?"} profilePicture={place.owner.profilePicture} className="h-12 w-12 flex-shrink-0 rounded-full" />
                <div>
                  <p className="text-sm font-bold">{place.owner.fullName}</p>
                  <p className="text-xs text-muted-foreground">Business Owner · Verified</p>
                  <p className="mt-0.5 text-xs text-slate-400 italic">Response rate — placeholder, pending Phase 6</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
