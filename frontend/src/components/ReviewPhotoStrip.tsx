import { useState } from "react"
import { Camera, ChevronDown, ChevronUp } from "lucide-react"
import { useGetReviewByIdQuery } from "@/lib/graphql/generated/graphql"
import { ImageLightbox } from "./ImageLightbox"

// Read-only, shared by ReviewCard (Place Detail) and ReviewListItem (My
// Reviews) - photoCount comes from the list query (cheap, materialized), the
// actual photo URLs are only fetched on demand once expanded (getReviewById,
// single-review scoped), never as part of the list itself. See
// docs/specs/phase-8-media-plumbing.md.
export function ReviewPhotoStrip({ reviewId, photoCount }: { reviewId: number; photoCount: number | null | undefined }) {
  const [expanded, setExpanded] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const { data, loading } = useGetReviewByIdQuery({ variables: { id: reviewId }, skip: !expanded })
  const photos = (data?.getReviewById?.data?.photos ?? []).filter((p): p is NonNullable<typeof p> => p !== null)

  if (!photoCount) {
    return null
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
      >
        <Camera className="h-3.5 w-3.5" />
        {photoCount} photo{photoCount === 1 ? "" : "s"}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {expanded && (
        <div className="mt-2 flex flex-wrap gap-2">
          {loading && <p className="text-xs text-muted-foreground">Loading photos...</p>}
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => photo.url && setLightboxUrl(photo.url)}
              className="block h-16 w-16 cursor-pointer overflow-hidden rounded-lg bg-slate-100"
            >
              {photo.url && <img src={photo.url} alt="" className="h-full w-full object-cover" />}
            </button>
          ))}
        </div>
      )}

      {lightboxUrl && <ImageLightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </div>
  )
}
