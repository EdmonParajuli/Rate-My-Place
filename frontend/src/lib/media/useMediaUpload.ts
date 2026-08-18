import { useState } from "react"
import { useMediaUploadSignatureLazyQuery, useAttachMediaMutation, type MediaKindEnum, type MediaOwnerTypeEnum } from "@/lib/graphql/generated/graphql"
import { uploadToCloudinary } from "./uploadToCloudinary"

type GetSignatureFn = ReturnType<typeof useMediaUploadSignatureLazyQuery>[0]
type AttachMediaFn = ReturnType<typeof useAttachMediaMutation>[0]

// The full signed-upload flow, as a plain function rather than a hook: ask
// the backend for a signature, upload straight to Cloudinary with it, then
// tell the backend the resulting URL so it can persist it (attachMedia).
// Extracted out of useMediaUpload below so PlaceDetailPage's create-review
// flow can call it for a review id that doesn't exist yet when the form
// first renders (so it can't call useMediaUpload, which binds ownerId at
// hook-call time) - see PendingPhotosPicker/WriteReviewForm.
export async function uploadMedia({
  getSignature,
  attachMediaMutation,
  kind,
  ownerType,
  ownerId,
  file,
}: {
  getSignature: GetSignatureFn
  attachMediaMutation: AttachMediaFn
  kind: MediaKindEnum
  ownerType: MediaOwnerTypeEnum
  ownerId: number | undefined
  file: File
}): Promise<void> {
  const sigResult = await getSignature({ variables: { ownerType, kind, ownerId } })
  const sig = sigResult.data?.mediaUploadSignature?.data
  if (!sig?.signature || !sig.timestamp || !sig.apiKey || !sig.cloudName || !sig.folder) {
    throw new Error("Could not get an upload signature. Please try again.")
  }

  const url = await uploadToCloudinary(file, {
    signature: sig.signature,
    timestamp: sig.timestamp,
    apiKey: sig.apiKey,
    cloudName: sig.cloudName,
    folder: sig.folder,
  })
  await attachMediaMutation({ variables: { input: { ownerType, ownerId, kind, url } } })
}

// Shared by ProfileHeader's avatar/cover and MyListingPage's place cover/
// gallery upload affordances, and ReviewPhotosSection - see
// docs/specs/phase-8-media-plumbing.md. ownerId is only meaningful for
// PLACE - ignored server-side for USER (always the caller's own account).
export function useMediaUpload(kind: MediaKindEnum, ownerType: MediaOwnerTypeEnum, ownerId: number | undefined, onUploaded: () => void) {
  const [getSignature] = useMediaUploadSignatureLazyQuery({ fetchPolicy: "network-only" })
  const [attachMediaMutation] = useAttachMediaMutation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      await uploadMedia({ getSignature, attachMediaMutation, kind, ownerType, ownerId, file })
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}
