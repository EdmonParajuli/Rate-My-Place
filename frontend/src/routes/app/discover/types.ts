import type { ListPlacesQuery } from "@/lib/graphql/generated/graphql"

export type DiscoverPlace = NonNullable<NonNullable<NonNullable<ListPlacesQuery["listPlaces"]>["data"]>[number]>
