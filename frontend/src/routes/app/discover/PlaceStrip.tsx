import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { PlaceCard } from "./PlaceCard"
import type { DiscoverPlace } from "./types"

export function PlaceStrip({
  icon,
  title,
  places,
  scroll = false,
}: {
  icon: ReactNode
  title: string
  places: DiscoverPlace[]
  scroll?: boolean
}) {
  if (places.length === 0) return null

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-base font-extrabold">{title}</h2>
        </div>
        <button type="button" className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary">
          See all <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      {scroll ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {places.map((place) => (
            <div key={place.id} className="w-64 flex-shrink-0">
              <PlaceCard place={place} compact />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} compact />
          ))}
        </div>
      )}
    </section>
  )
}
