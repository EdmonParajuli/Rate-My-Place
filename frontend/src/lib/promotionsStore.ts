// Client-side-only, this-device-only - no promotions/offers concept exists
// anywhere in the backend (see docs/specs/phase-6-business-console-figma-prompt.md's
// "Promotions - not real at all" grounding note), so this never touches the
// API. Same localStorage precedent as src/lib/drafts.ts, keyed by placeId
// since promotions belong to a specific business listing.
export type PromotionType = "Discount" | "Featured Placement" | "Special Offer" | "Event"

export type Promotion = {
  id: string
  placeId: number
  name: string
  type: PromotionType
  description: string
  startDate: string
  endDate: string
}

const STORAGE_KEY = "rmp_promotions"

function readAll(): Record<string, Promotion[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, Promotion[]>) : {}
  } catch {
    return {}
  }
}

function writeAll(all: Record<string, Promotion[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function getPromotions(placeId: number): Promotion[] {
  return readAll()[String(placeId)] ?? []
}

export function createPromotion(placeId: number, input: Omit<Promotion, "id" | "placeId">): Promotion {
  const promotion: Promotion = { id: `promo-${Date.now()}`, placeId, ...input }
  const all = readAll()
  all[String(placeId)] = [promotion, ...(all[String(placeId)] ?? [])]
  writeAll(all)
  return promotion
}

export function deletePromotion(placeId: number, id: string): void {
  const all = readAll()
  all[String(placeId)] = (all[String(placeId)] ?? []).filter((p) => p.id !== id)
  writeAll(all)
}

export function getPromotionStatus(promo: Promotion): "Active" | "Scheduled" | "Ended" {
  const today = new Date().toISOString().slice(0, 10)
  if (promo.startDate > today) return "Scheduled"
  if (promo.endDate < today) return "Ended"
  return "Active"
}
