import { useState } from "react"
import { useMediaUploadSignatureLazyQuery, useAttachMediaMutation, type MediaKindEnum, type MediaOwnerTypeEnum } from "@/lib/graphql/generated/graphql"
import { uploadToCloudinary } from "./uploadToCloudinary"

// Orchestrates the full signed-upload flow: ask the backend for a signature,
// upload straight to Cloudinary with it, then tell the backend the resulting
// URL so it can persist it (attachMedia). Shared by ProfileHeader's avatar/
// cover and MyListingPage's place cover/gallery upload affordances - see
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
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}
