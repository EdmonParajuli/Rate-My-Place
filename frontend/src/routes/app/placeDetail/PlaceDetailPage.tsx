import { useEffect, useRef, useState } from "react"
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
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { useAuth } from "@/lib/auth/AuthContext"
import {
  useGetPlaceByIdQuery,
  usePlaceByReviewTokenQuery,
  usePlaceReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleHelpfulVoteMutation,
  useCreateReviewReplyMutation,
  useListPlacesQuery,
  useMediaUploadSignatureLazyQuery,
  useAttachMediaMutation,
  type ReviewSortEnum,
} from "@/lib/graphql/generated/graphql"
import { saveDraft } from "@/lib/drafts"
import { uploadMedia } from "@/lib/media/useMediaUpload"
import { RatingOverview } from "./RatingOverview"
import { WriteReviewForm } from "./WriteReviewForm"
import { ReviewCard } from "./ReviewCard"
import { ScanAuthModal } from "./ScanAuthModal"
import { dayName, formatTime, sortByDay } from "./formatHours"
import type { PlaceReview } from "./types"

const PRICE_SYMBOL: Record<string, string> = { LOW: "$", MEDIUM: "$$", HIGH: "$$$" }
const SORTS: { value: ReviewSortEnum; label: string }[] = [
  { value: "RECENT", label: "Most Recent" },
  { value: "HELPFUL", label: "Most Helpful" },
]

export function PlaceDetailPage() {
  // Two distinct entry points render this same component (router.tsx):
  // /app/places/:placeId (authenticated, existing) and /r/:token (public QR
  // scan, ticket 03) - reusing the real place page rather than a second
  // review UI, per docs/specs/phase-11-qr-review-flow.md's locked decision.
  const { placeId, token } = useParams<{ placeId?: string; token?: string }>()
  const isTokenEntry = Boolean(token)
  const id = Number(placeId)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [sort, setSort] = useState<ReviewSortEnum>("RECENT")
  const [hoursOpen, setHoursOpen] = useState(false)
  // Starts open on a scan entry - the whole point is landing directly on the
  // type box, no extra click (Q7/Q9).
  const [writeFormOpen, setWriteFormOpen] = useState(isTokenEntry)
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  // Not nested inside writeFormOpen's block - a photo-upload failure happens
  // after the review is already successfully created (see handleSubmitReview),
  // so the form has already closed by the time this can be set; it needs to
  // stay visible past that.
  const [photoUploadWarning, setPhotoUploadWarning] = useState<string | null>(null)
  // Q8: a repeat scan from someone who's already reviewed this place gets a
  // notice, then lands in edit mode - not a silent drop into editing.
  const [showAlreadyReviewedNotice, setShowAlreadyReviewedNotice] = useState(false)
  const hasCheckedExistingReviewRef = useRef(false)
  // Replaces a bare window.confirm() (edge case 3.5) - undismissable through
  // browser-automation tooling and inconsistent with the rest of the app's
  // confirmation UX (see ConfirmDialog).
  const [pendingDeleteReviewId, setPendingDeleteReviewId] = useState<number | null>(null)

  const { data: placeData, loading: placeByIdLoading, refetch: refetchPlaceById } = useGetPlaceByIdQuery({
    variables: { id },
    skip: isTokenEntry,
  })
  const { data: tokenPlaceData, loading: placeByTokenLoading, refetch: refetchPlaceByToken } = usePlaceByReviewTokenQuery({
    variables: { token: token ?? "" },
    skip: !isTokenEntry,
  })
  const place = isTokenEntry ? tokenPlaceData?.placeByReviewToken?.data : placeData?.getPlaceById?.data
  const placeLoading = isTokenEntry ? placeByTokenLoading : placeByIdLoading
  // The real numeric id once place resolves either way - place.id for both
  // entry modes once loaded, falling back to the URL param before that
  // (already correct immediately for the placeId-route entry; NaN and
  // harmless for the token entry, where every query below is skipped until
  // place.id is known).
  const resolvedPlaceId = place?.id ?? id

  const { data: reviewsData, refetch: refetchReviews } = usePlaceReviewsQuery({
    variables: { placeId: resolvedPlaceId, first: 20, sort },
    skip: isTokenEntry && !place?.id,
  })
  const reviews = (reviewsData?.placeReviews?.data ?? []).filter((r): r is PlaceReview => r !== null)

  useEffect(() => {
    if (!isTokenEntry || !user || hasCheckedExistingReviewRef.current || !reviewsData) return
    hasCheckedExistingReviewRef.current = true
    const existingReview = reviews.find((r) => r.reviewerId === user.id)
    if (existingReview?.id) {
      setShowAlreadyReviewedNotice(true)
      setEditingReviewId(existingReview.id)
    }
  }, [isTokenEntry, user, reviewsData, reviews])

  // Single-review scoped fetch, seeds the edit form's photo gallery - not
  // part of placeReviews above, which would be a real N+1. See
  // docs/specs/phase-8-media-plumbing.md.
  const { data: editingReviewData, refetch: refetchEditingReviewPhotos } = useGetReviewByIdQuery({
    variables: { id: editingReviewId ?? 0 },
    skip: !editingReviewId,
  })
  const editingReviewPhotos = (editingReviewData?.getReviewById?.data?.photos ?? []).filter((p): p is NonNullable<typeof p> => p !== null)

  const { data: similarData } = useListPlacesQuery({
    variables: { filter: { categoryId: place?.category?.id ?? undefined }, first: 4 },
    skip: !place?.category?.id,
  })
  const similarPlaces = (similarData?.listPlaces?.data ?? []).filter((p) => p !== null && p.id !== resolvedPlaceId).slice(0, 3)

  const [createReview] = useCreateReviewMutation()
  const [updateReview] = useUpdateReviewMutation()
  const [deleteReview] = useDeleteReviewMutation()
  const [toggleHelpfulVote] = useToggleHelpfulVoteMutation()
  const [createReviewReply] = useCreateReviewReplyMutation()
  const [getMediaUploadSignature] = useMediaUploadSignatureLazyQuery({ fetchPolicy: "network-only" })
  const [attachMedia] = useAttachMediaMutation()

  const refetchAll = () => Promise.all([isTokenEntry ? refetchPlaceByToken() : refetchPlaceById(), refetchReviews()])

  if (placeLoading) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading place...</p>
  }
  if (!place) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-700">{isTokenEntry ? "This QR code isn't valid" : "Place not found"}</p>
        {!isTokenEntry && (
          <Link to="/app" className="mt-2 inline-block text-sm text-primary">
            Back to Discover
          </Link>
        )}
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
    saveDraft({ placeId: resolvedPlaceId, placeName: place?.label ?? "this place", rating, text })
    setWriteFormOpen(false)
  }

  const handleSubmitReview = async (rating: number, text: string, photoFiles: File[]) => {
    setReviewError(null)
    setPhotoUploadWarning(null)
    setSubmittingReview(true)
    try {
      if (editingReview?.id) {
        await updateReview({ variables: { reviewId: editingReview.id, input: { review: text, rating } } })
      } else {
        const result = await createReview({ variables: { placeId: resolvedPlaceId, input: { review: text, rating } } })
        const newReviewId = result.data?.createReview?.data?.id

        if (newReviewId != null && photoFiles.length > 0) {
          const failures = (
            await Promise.allSettled(
              photoFiles.map((file) =>
                uploadMedia({ getSignature: getMediaUploadSignature, attachMediaMutation: attachMedia, kind: "PHOTO", ownerType: "REVIEW", ownerId: newReviewId, file })
              )
            )
          ).filter((r) => r.status === "rejected").length

          if (failures > 0) {
            setPhotoUploadWarning(
              `Your review was posted, but ${failures} photo${failures === 1 ? "" : "s"} failed to upload. Edit your review to try again.`
            )
          }
        }
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

  const confirmDeleteReview = async () => {
    if (!pendingDeleteReviewId) return
    await deleteReview({ variables: { reviewId: pendingDeleteReviewId } })
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

  const scanAuthModalOpen = isTokenEntry && !user

  return (
    <>
    {/* Marked inert while ScanAuthModal is up (edge case 3.2) - the overlay
        already blocks mouse interaction, but without this a keyboard/screen-
        reader user could Tab or virtual-cursor straight through it into the
        dimmed review form underneath. ScanAuthModal itself renders as a
        sibling below, outside this wrapper, so it's never made inert. */}
    <div inert={scanAuthModalOpen}>
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
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {place.profilePicture ? (
                  <img src={place.profilePicture} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-slate-300" />
                )}
              </div>
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
              {showAlreadyReviewedNotice && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                  You've already reviewed this place — here's your review to edit.
                </div>
              )}
              <WriteReviewForm
                // Forces a remount when what we're editing changes identity -
                // WriteReviewForm seeds its rating/text via useState(initial...)
                // only once per mount. On the normal /app/places/:id flow that's
                // never an issue (editingReviewId is already set before this
                // component ever mounts, via openEditForm's synchronous state
                // update). On the QR scan entry, writeFormOpen starts true on
                // the very first render, before reviews have loaded - so this
                // mounts once with editingReview still undefined, then Q8's
                // auto-open effect sets editingReviewId asynchronously once the
                // data arrives. Without this key, the already-mounted form
                // never picks up the real initialRating/initialText and stays
                // blank despite reviewId being correctly wired underneath.
                key={editingReview?.id ?? "new"}
                placeName={place.label}
                initialRating={editingReview?.rating ?? undefined}
                initialText={editingReview?.review ?? undefined}
                isEditing={Boolean(editingReview)}
                reviewId={editingReview?.id}
                photos={editingReviewPhotos}
                submitting={submittingReview}
                onCancel={cancelWriteForm}
                onSubmit={handleSubmitReview}
                onSaveDraft={editingReview || isTokenEntry ? undefined : handleSaveDraft}
                onPhotosChanged={() => {
                  void refetchEditingReviewPhotos()
                  void refetchReviews()
                }}
              />
              {reviewError && <p className="text-xs text-destructive">{reviewError}</p>}
            </>
          ) : null}

          {photoUploadWarning && <p className="text-xs text-amber-600">{photoUploadWarning}</p>}

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
                    onDelete={() => review.id && setPendingDeleteReviewId(review.id)}
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
    {scanAuthModalOpen && <ScanAuthModal placeName={place.label} />}
    {pendingDeleteReviewId !== null && (
      <ConfirmDialog
        title="Delete your review?"
        description="This can't be undone."
        onConfirm={confirmDeleteReview}
        onClose={() => setPendingDeleteReviewId(null)}
      />
    )}
    </>
  )
}
