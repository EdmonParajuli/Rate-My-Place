import { useRef, useState } from "react"
import { Camera, Loader2, Plus, X } from "lucide-react"
import { useRemoveMediaMutation } from "@/lib/graphql/generated/graphql"
import { useMediaUpload } from "@/lib/media/useMediaUpload"

const MAX_PHOTOS = 12

type GalleryPhoto = { id?: number | null; url?: string | null }

// No Figma reference for this section - both personas' sources predate Phase
// 8 Media entirely, and My Listing's "Photo uploads coming soon" placeholder
// was always a stand-in for whatever this turned out to be. See
// docs/specs/phase-8-media-plumbing.md.
export function PlacePhotosSection({
  placeId,
  coverPhotoUrl,
  photos,
  onChanged,
}: {
  placeId: number
  coverPhotoUrl: string | null | undefined
  photos: GalleryPhoto[]
  onChanged: () => void
}) {
  const coverInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [removeMediaMutation] = useRemoveMediaMutation()
  const [removingId, setRemovingId] = useState<number | null>(null)

  const coverUpload = useMediaUpload("COVER", "PLACE", placeId, onChanged)
  const galleryUpload = useMediaUpload("PHOTO", "PLACE", placeId, onChanged)

  function handleFileChange(input: HTMLInputElement, upload: (file: File) => void) {
    const file = input.files?.[0]
    if (file) {
      upload(file)
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
  const error = coverUpload.error || galleryUpload.error

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-5 border-b border-slate-100 pb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">Photos</h3>

      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cover Photo</label>
        <p className="mb-2.5 text-xs text-slate-400">Shown on Discover cards and at the top of your listing.</p>
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
            {coverPhotoUrl ? (
              <img src={coverPhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-6 w-6 text-slate-300" />
            )}
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target, coverUpload.upload)} />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUpload.uploading}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {coverUpload.uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {coverUpload.uploading ? "Uploading..." : coverPhotoUrl ? "Change Cover" : "Add Cover"}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          Gallery <span className="font-normal text-slate-400">({photos.length}/{MAX_PHOTOS})</span>
        </label>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
              {photo.url && <img src={photo.url} alt="" className="h-full w-full object-cover" />}
              <button
                type="button"
                onClick={() => photo.id != null && handleRemove(photo.id)}
                disabled={removingId === photo.id}
                className="absolute top-1.5 right-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
                aria-label="Remove photo"
              >
                {removingId === photo.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              </button>
            </div>
          ))}

          <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target, galleryUpload.upload)} />
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={galleryUpload.uploading || atCap}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {galleryUpload.uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            <span className="text-[11px] font-semibold">{atCap ? "Limit reached" : "Add Photo"}</span>
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs font-medium text-destructive">{error}</p>}
    </section>
  )
}
