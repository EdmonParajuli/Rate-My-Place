// Client-side-only, this-device-only feature (docs/specs/phase-4-frontend-mvp.md
// §7's My Reviews resolution) - no backend draft concept exists at all
// (createReview publishes directly), so drafts never touch the API. Entry
// point is Place Detail's WriteReviewForm ("Save as Draft"); My Reviews'
// Drafts tab is where they're viewed, continued, and deleted.
export type ReviewDraft = {
  id: string
  placeId: number
  placeName: string
  rating: number
  text: string
  savedAt: string
}

const DRAFTS_KEY = "rmp_review_drafts"

export function getDrafts(): ReviewDraft[] {
  try {
    const raw = localStorage.getItem(DRAFTS_KEY)
    return raw ? (JSON.parse(raw) as ReviewDraft[]) : []
  } catch {
    return []
  }
}

function persist(drafts: ReviewDraft[]): void {
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
}

export function saveDraft(input: { placeId: number; placeName: string; rating: number; text: string }): ReviewDraft {
  const draft: ReviewDraft = { id: `draft-${Date.now()}`, savedAt: new Date().toISOString(), ...input }
  persist([draft, ...getDrafts()])
  return draft
}

export function updateDraft(id: string, changes: { rating: number; text: string }): void {
  persist(getDrafts().map((d) => (d.id === id ? { ...d, ...changes, savedAt: new Date().toISOString() } : d)))
}

export function deleteDraft(id: string): void {
  persist(getDrafts().filter((d) => d.id !== id))
}
