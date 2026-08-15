import { useState } from "react"
import { Heart } from "lucide-react"
import {
  useSavedPlacesQuery,
  useMyReviewsQuery,
  useToggleSavePlaceMutation,
  useSetSavedPlaceListTypeMutation,
  type SavedListTypeEnum,
} from "@/lib/graphql/generated/graphql"
import { formatDate } from "@/lib/formatDate"
import { SavedPlaceCard } from "./SavedPlaceCard"
import type { DiscoverPlace } from "../discover/types"

type Tab = "ALL" | "WANT_TO_VISIT" | "REVIEWED" | "FAVORITE"

const TABS: { value: Tab; label: string }[] = [
  { value: "ALL", label: "All Saved" },
  { value: "WANT_TO_VISIT", label: "Want to Visit" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "FAVORITE", label: "Favorites" },
]

const EMPTY_COPY: Record<Tab, { title: string; subtitle: string }> = {
  ALL: { title: "Nothing saved yet", subtitle: "Tap the heart on any place to save it here." },
  WANT_TO_VISIT: { title: "No places marked yet", subtitle: "Move a saved place here once you decide you want to visit." },
  REVIEWED: { title: "No reviews yet", subtitle: "Places you review show up here automatically - no need to save them first." },
  FAVORITE: { title: "No favorites yet", subtitle: "Move a saved place here once it's become one of your favorites." },
}

export function SavedPage() {
  const [tab, setTab] = useState<Tab>("ALL")

  const { data: savedData, loading: savedLoading, refetch: refetchSaved } = useSavedPlacesQuery({ variables: { filter: "ALL" } })
  const savedPlaces = (savedData?.savedPlaces?.data ?? []).filter((sp): sp is NonNullable<typeof sp> => sp !== null && sp.place !== null && sp.place !== undefined)

  const { data: reviewsData, loading: reviewsLoading } = useMyReviewsQuery({ variables: { first: 50 } })
  const reviewedPlaces = (reviewsData?.myReviews?.data ?? []).filter(
    (r): r is NonNullable<typeof r> => r !== null && r.place !== null && r.place !== undefined
  )

  const [toggleSavePlace] = useToggleSavePlaceMutation()
  const [setSavedPlaceListType] = useSetSavedPlaceListTypeMutation()

  const handleRemove = async (placeId: number) => {
    await toggleSavePlace({ variables: { placeId } })
    await refetchSaved()
  }

  const handleRecategorize = async (placeId: number, listType: SavedListTypeEnum) => {
    await setSavedPlaceListType({ variables: { placeId, listType } })
    await refetchSaved()
  }

  const loading = tab === "REVIEWED" ? reviewsLoading : savedLoading
  const filteredSaved = tab === "ALL" ? savedPlaces : savedPlaces.filter((sp) => sp.listType === tab)

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Saved</h1>
        <p className="mt-1 text-sm text-slate-500">Places you've saved, want to visit, or already reviewed.</p>
      </div>

      <div className="flex gap-1 self-start overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              tab === t.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
      ) : tab === "REVIEWED" ? (
        reviewedPlaces.length === 0 ? (
          <EmptyState {...EMPTY_COPY.REVIEWED} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {reviewedPlaces.map((review) => (
              <SavedPlaceCard
                key={review.id}
                place={review.place as DiscoverPlace}
                listType="REVIEWED"
                dateLabel={`Reviewed ${formatDate(review.createdAt)}`}
              />
            ))}
          </div>
        )
      ) : filteredSaved.length === 0 ? (
        <EmptyState {...EMPTY_COPY[tab]} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredSaved.map((savedPlace) => (
            <SavedPlaceCard
              key={savedPlace.id}
              place={savedPlace.place as DiscoverPlace}
              listType={(savedPlace.listType ?? "SAVED") as "SAVED" | "WANT_TO_VISIT" | "FAVORITE"}
              dateLabel={`Saved ${formatDate(savedPlace.createdAt)}`}
              onRemove={() => handleRemove(savedPlace.placeId!)}
              onRecategorize={(listType) => handleRecategorize(savedPlace.placeId!, listType)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
        <Heart className="h-6 w-6 text-destructive" />
      </div>
      <p className="font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
    </div>
  )
}
