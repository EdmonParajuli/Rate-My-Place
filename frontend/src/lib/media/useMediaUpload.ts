import { useState } from "react"
import { useMediaUploadSignatureLazyQuery, useAttachMediaMutation, type MediaKindEnum } from "@/lib/graphql/generated/graphql"
import { uploadToCloudinary } from "./uploadToCloudinary"

// Orchestrates the full signed-upload flow: ask the backend for a signature,
// upload straight to Cloudinary with it, then tell the backend the resulting
// URL so it can persist it (attachMedia). Shared by ProfileHeader's avatar
// and cover upload affordances - see docs/specs/phase-8-media-plumbing.md.
export function useMediaUpload(kind: MediaKindEnum, onUploaded: () => void) {
  const [getSignature] = useMediaUploadSignatureLazyQuery({ fetchPolicy: "network-only" })
  const [attachMediaMutation] = useAttachMediaMutation()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(file: File) {
    setUploading(true)
    setError(null)
    try {
      const sigResult = await getSignature({ variables: { kind } })
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
      await attachMediaMutation({ variables: { input: { kind, url } } })
      onUploaded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}
