import type { PriceRangeEnum } from "@/lib/graphql/generated/graphql"

export type DiscoverPriceRange = PriceRangeEnum

// PlaceFilterInput.categoryId/priceRange are each a single value, not an
// array (backend/src/graphql/typeDefs/placeTypedefs.ts) - filters here are
// single-select, unlike prototype/discover-screen's mock multi-select chips,
// which the real API can't actually express.
export type DiscoverFilters = {
  categoryId: number | null
  priceRange: DiscoverPriceRange | null
  minRating: number
  openNow: boolean
  query: string
}

export const EMPTY_FILTERS: DiscoverFilters = {
  categoryId: null,
  priceRange: null,
  minRating: 0,
  openNow: false,
  query: "",
}
