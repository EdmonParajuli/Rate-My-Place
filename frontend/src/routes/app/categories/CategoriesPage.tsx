import { useCategoriesQuery, usePlatformStatsQuery } from "@/lib/graphql/generated/graphql"
import { PlatformStatsRow } from "./PlatformStatsRow"
import { CategoryCard } from "./CategoryCard"
import type { CategorySummary } from "./types"

export function CategoriesPage() {
  const { data, loading } = useCategoriesQuery()
  const { data: statsData } = usePlatformStatsQuery()

  const categories = (data?.categories?.data ?? []).filter((c): c is CategorySummary => c !== null)

  return (
    <div>
      <div className="hero-gradient m-4 mb-0 rounded-3xl px-6 py-10 text-center md:m-6 md:mb-0">
        <p className="relative mb-3 text-xs font-bold tracking-widest text-accent uppercase">Browse by Interest</p>
        <h2 className="relative mb-3 text-3xl font-extrabold text-white">
          Explore Places
          <br />
          by Category
        </h2>
        <p className="relative mx-auto max-w-md text-sm text-slate-400">
          Find the best places based on your interests — from top-rated restaurants to trusted healthcare providers.
        </p>
      </div>

      <div className="p-4 md:p-6">
        <PlatformStatsRow
          totalPlaces={statsData?.platformStats?.data?.totalPlaces ?? 0}
          totalCategories={categories.length}
          totalReviews={statsData?.platformStats?.data?.totalReviews ?? 0}
        />

        <h3 className="mb-4 text-base font-extrabold">All Categories</h3>
        {loading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading categories...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
