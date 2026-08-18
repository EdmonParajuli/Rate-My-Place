import { useRef } from "react"
import { Camera, Plus, X } from "lucide-react"

const MAX_PHOTOS = 6

export type PendingPhoto = { file: File; previewUrl: string }

// Local-only counterpart to ReviewPhotosSection, for a review that doesn't
// exist yet (photo upload needs a real reviewId to attach to - see
// ReviewPhotosSection's comment). Just holds File objects + object-URL
// previews client-side; WriteReviewForm hands the files up on submit, and
// PlaceDetailPage uploads them (via uploadMedia) once createReview has
// returned a real id.
export function PendingPhotosPicker({ photos, onChange }: { photos: PendingPhoto[]; onChange: (photos: PendingPhoto[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(input: HTMLInputElement) {
    const file = input.files?.[0]
    if (file) {
      onChange([...photos, { file, previewUrl: URL.createObjectURL(file) }])
    }
    input.value = ""
  }

  function handleRemove(index: number) {
    URL.revokeObjectURL(photos[index].previewUrl)
    onChange(photos.filter((_, i) => i !== index))
  }

  const atCap = photos.length >= MAX_PHOTOS

  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">
        Photos <span className="font-normal normal-case text-slate-400">({photos.length}/{MAX_PHOTOS})</span>
      </p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {photos.map((photo, index) => (
          <div key={photo.previewUrl} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
            <img src={photo.previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target)} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={atCap}
          className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-slate-200 text-slate-400 transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {!atCap && <span className="text-[9px] font-semibold">Add</span>}
        </button>
      </div>
      {photos.length === 0 && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
          <Camera className="h-3 w-3" /> No photos yet
        </p>
      )}
    </div>
  )
}
