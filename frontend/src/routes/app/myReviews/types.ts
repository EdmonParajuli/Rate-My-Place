import type { MyReviewsQuery } from "@/lib/graphql/generated/graphql"

export type MyReview = NonNullable<NonNullable<NonNullable<MyReviewsQuery["myReviews"]>["data"]>[number]>
