import type { ListPlacesQuery } from "@/lib/graphql/generated/graphql"

export type TrendingPlace = NonNullable<NonNullable<NonNullable<ListPlacesQuery["listPlaces"]>["data"]>[number]>
