import { Link, useParams } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { useCategoryQuery, useListPlacesQuery } from "@/lib/graphql/generated/graphql"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"
import { getCategoryIcon } from "@/lib/categoryIcons"
import { PlaceCard } from "../discover/PlaceCard"
import { RankedPlaceRow } from "./RankedPlaceRow"
import type { DiscoverPlace } from "../discover/types"

export function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const id = Number(categoryId)

  const { data, loading } = useCategoryQuery({ variables: { id } })
  const category = data?.category?.data

  const { data: topRatedData } = useListPlacesQuery({ variables: { filter: { categoryId: id }, sort: "HIGHEST_RATED", first: 3 } })
  const topRated = (topRatedData?.listPlaces?.data ?? []).filter((p): p is DiscoverPlace => p !== null)

  const { data: trendingData } = useListPlacesQuery({ variables: { filter: { categoryId: id }, sort: "TRENDING", first: 10 } })
  const trending = (trendingData?.listPlaces?.data ?? []).filter((p): p is DiscoverPlace => p !== null)

  if (loading) {
    return <p className="p-6 text-center text-sm text-muted-foreground">Loading category...</p>
  }

  if (!category) {
    return (
      <div className="p-6 text-center">
        <p className="font-bold text-slate-700">Category not found</p>
        <Link to="/app/categories" className="mt-2 inline-block text-sm text-primary">
          Back to Categories
        </Link>
      </div>
    )
  }

  const style = category.label ? CATEGORY_STYLES[category.label] : undefined
  const Icon = getCategoryIcon(category.icon)

  return (
    <div>
      <div className={`bg-gradient-to-br ${style?.gradient ?? "from-slate-500 to-slate-700"} px-6 py-10`}>
        <Link to="/app/categories" className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-white/80 transition-colors hover:text-white">
          <ChevronLeft className="h-4 w-4" /> Back to Categories
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">{category.label}</h2>
            <p className="text-sm text-white/70">
              {(category.businessCount ?? 0).toLocaleString()} businesses · {(category.avgRating ?? 0).toFixed(1)}★ average rating
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 px-4 py-6 md:px-6">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-extrabold">Top Rated</h3>
          </div>
          {topRated.length === 0 ? (
            <p className="text-sm text-muted-foreground">No places in this category yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {topRated.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </section>

        <section className="pb-6">
          <h3 className="mb-4 font-extrabold">Trending Now</h3>
          {trending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No places in this category yet.</p>
          ) : (
            <div className="space-y-3">
              {trending.map((place, i) => (
                <RankedPlaceRow key={place.id} place={place} rank={i + 1} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
