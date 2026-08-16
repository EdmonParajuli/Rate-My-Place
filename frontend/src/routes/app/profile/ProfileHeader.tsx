import { useRef } from "react"
import { CalendarDays, Camera, Loader2 } from "lucide-react"
import { UserAvatar } from "@/components/UserAvatar"
import { formatDate } from "@/lib/formatDate"
import { useMediaUpload } from "@/lib/media/useMediaUpload"

// Cover falls back to the static brand-gradient bar when coverPicture isn't
// set (still true for every account that hasn't uploaded one) - not
// illustrative-preview labeling, just an empty state. Neither avatar nor
// cover upload has a Figma reference (doc 3 designed the MEDIA table's
// AVATAR/COVER kinds, but no screen in either persona's source shows this
// interaction) - the camera-icon overlay pattern here is a reasonable,
// common convention, not a Figma translation. See
// docs/specs/phase-8-media-plumbing.md.
export function ProfileHeader({
  name,
  userType,
  profilePicture,
  coverPicture,
  memberSince,
  onMediaUploaded,
}: {
  name: string
  userType: string | null
  profilePicture: string | null
  coverPicture: string | null
  memberSince: string | null | undefined
  onMediaUploaded: () => void
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const avatarUpload = useMediaUpload("AVATAR", "USER", undefined, onMediaUploaded)
  const coverUpload = useMediaUpload("COVER", "USER", undefined, onMediaUploaded)

  function handleFileChange(input: HTMLInputElement, upload: (file: File) => void) {
    const file = input.files?.[0]
    if (file) {
      upload(file)
    }
    input.value = ""
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="relative h-24 bg-gradient-to-r from-primary to-blue-400 sm:h-28">
        {coverPicture && <img src={coverPicture} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target, coverUpload.upload)} />
        <button
          onClick={() => coverInputRef.current?.click()}
          disabled={coverUpload.uploading}
          className="absolute bottom-2 right-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {coverUpload.uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          {coverUpload.uploading ? "Uploading..." : "Change cover"}
        </button>
      </div>
      <div className="flex flex-col items-center gap-3 px-5 pb-5 sm:flex-row sm:items-end sm:gap-4">
        <div className="relative -mt-10 flex-shrink-0 sm:-mt-12">
          <UserAvatar
            name={name}
            profilePicture={profilePicture}
            className="h-20 w-20 rounded-full border-4 border-card text-lg sm:h-24 sm:w-24"
          />
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target, avatarUpload.upload)} />
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUpload.uploading}
            className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
            aria-label="Change avatar"
          >
            {avatarUpload.uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="min-w-0 flex-1 pt-1 text-center sm:pt-0 sm:text-left">
          <h1 className="truncate text-xl font-extrabold">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
              {userType === "BUSINESS" ? "Business owner" : "Reviewer"}
            </span>
            {memberSince && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Member since {formatDate(memberSince)}
              </span>
            )}
          </div>
          {(avatarUpload.error || coverUpload.error) && (
            <p className="mt-1 text-xs font-medium text-destructive">{avatarUpload.error || coverUpload.error}</p>
          )}
        </div>
      </div>
    </div>
  )
}
