import type { CategoriesQuery } from "@/lib/graphql/generated/graphql"

export type CategorySummary = NonNullable<NonNullable<NonNullable<CategoriesQuery["categories"]>["data"]>[number]>
