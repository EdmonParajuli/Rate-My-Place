import type { GetPlaceByIdQuery, PlaceReviewsQuery } from "@/lib/graphql/generated/graphql"

export type PlaceDetail = NonNullable<NonNullable<GetPlaceByIdQuery["getPlaceById"]>["data"]>
export type PlaceReview = NonNullable<NonNullable<NonNullable<PlaceReviewsQuery["placeReviews"]>["data"]>[number]>
