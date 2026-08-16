import { useRef, useState } from "react"
import { Camera, Loader2, Plus, X } from "lucide-react"
import { useRemoveMediaMutation } from "@/lib/graphql/generated/graphql"
import { useMediaUpload } from "@/lib/media/useMediaUpload"

const MAX_PHOTOS = 6

type GalleryPhoto = { id?: number | null; url?: string | null }

// Editable gallery, only shown while editing an existing review - photo
// upload needs a real reviewId to attach to (MediaService checks ownership
// against the review), so a brand-new, not-yet-submitted review can't take
// photos yet. No Figma reference for this either (same situation as place
// photo galleries) - a smaller, cover-less version of PlacePhotosSection.
// See docs/specs/phase-8-media-plumbing.md.
export function ReviewPhotosSection({
  reviewId,
  photos,
  onChanged,
}: {
  reviewId: number
  photos: GalleryPhoto[]
  onChanged: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [removeMediaMutation] = useRemoveMediaMutation()
  const [removingId, setRemovingId] = useState<number | null>(null)
  const upload = useMediaUpload("PHOTO", "REVIEW", reviewId, onChanged)

  function handleFileChange(input: HTMLInputElement) {
    const file = input.files?.[0]
    if (file) {
      upload.upload(file)
    }
    input.value = ""
  }

  async function handleRemove(mediaId: number) {
    setRemovingId(mediaId)
    try {
      await removeMediaMutation({ variables: { mediaId } })
      onChanged()
    } finally {
      setRemovingId(null)
    }
  }

  const atCap = photos.length >= MAX_PHOTOS

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">
        Photos <span className="font-normal normal-case text-slate-400">({photos.length}/{MAX_PHOTOS})</span>
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
            {photo.url && <img src={photo.url} alt="" className="h-full w-full object-cover" />}
            <button
              type="button"
              onClick={() => photo.id != null && handleRemove(photo.id)}
              disabled={removingId === photo.id}
              className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
              aria-label="Remove photo"
            >
              {removingId === photo.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
            </button>
          </div>
        ))}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target)} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={upload.uploading || atCap}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {upload.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {!atCap && <span className="text-[9px] font-semibold">Add</span>}
        </button>
      </div>
      {upload.error && <p className="mt-1.5 text-xs font-medium text-destructive">{upload.error}</p>}
      {photos.length === 0 && !upload.uploading && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
          <Camera className="h-3 w-3" /> No photos yet
        </p>
      )}
    </div>
  )
}
