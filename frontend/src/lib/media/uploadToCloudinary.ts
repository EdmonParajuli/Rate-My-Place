// Direct browser->Cloudinary upload using a signature the backend generated
// (mediaUploadSignature) - file bytes never pass through this app's own
// GraphQL server. Must send exactly the fields the backend signed
// (folder + timestamp) plus api_key/signature/file, or Cloudinary rejects
// the signature. See docs/specs/phase-8-media-plumbing.md.
export type CloudinaryUploadSignature = {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
}

export async function uploadToCloudinary(file: File, sig: CloudinaryUploadSignature): Promise<string> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("api_key", sig.apiKey)
  formData.append("timestamp", String(sig.timestamp))
  formData.append("signature", sig.signature)
  formData.append("folder", sig.folder)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.error?.message ?? "Upload failed. Please try again.")
  }

  const data = await response.json()
  return data.secure_url as string
}
