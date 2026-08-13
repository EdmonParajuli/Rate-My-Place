import { useState } from "react"
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { List, Search } from "lucide-react"
import { PlaceListRow } from "./PlaceListRow"
import type { DiscoverPlace } from "./types"

// Custom divIcon, not Leaflet's default marker - the default marker image
// paths don't resolve correctly under Vite's bundling (a well-known Leaflet
// gotcha), and a plain colored pin matches the design better than the
// generic default anyway.
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:9999px;background:#2563EB;border:2px solid white;box-shadow:0 2px 6px rgba(15,23,42,0.35);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const DEFAULT_CENTER: [number, number] = [40.7128, -74.006] // fallback only - used when no place in the current results has coordinates

export function MapView({
  places,
  loading,
  query,
  onQueryChange,
  onBackToList,
}: {
  places: DiscoverPlace[]
  loading: boolean
  query: string
  onQueryChange: (query: string) => void
  onBackToList: () => void
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const withCoords = places.filter(
    (p): p is DiscoverPlace & { latitude: number; longitude: number } => typeof p.latitude === "number" && typeof p.longitude === "number"
  )
  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords.reduce((sum, p) => sum + p.latitude, 0) / withCoords.length, withCoords.reduce((sum, p) => sum + p.longitude, 0) / withCoords.length]
      : DEFAULT_CENTER

  return (
    <div className="p-4 md:p-6">
      <div className="flex h-[calc(100vh-9.5rem)] overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex w-full flex-shrink-0 flex-col overflow-hidden border-r border-border lg:w-[380px]">
          <div className="space-y-3 border-b border-border p-4">
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search places..."
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
          </div>
          <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
            {loading ? "Loading..." : `${places.length} place${places.length === 1 ? "" : "s"}`}
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto px-4 pb-4">
            {places.length === 0 && !loading ? (
              <div className="px-4 py-16 text-center">
                <p className="text-sm font-bold text-slate-700">No places found</p>
                <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            ) : (
              places.map((place) => <PlaceListRow key={place.id} place={place} active={hoveredId === place.id} onHover={setHoveredId} />)
            )}
          </div>
        </div>

        <div className="relative hidden flex-1 lg:block">
          <MapContainer center={center} zoom={withCoords.length > 0 ? 12 : 3} className="h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {withCoords.map((place) => (
              <Marker key={place.id} position={[place.latitude, place.longitude]} icon={pinIcon} eventHandlers={{ mouseover: () => setHoveredId(place.id ?? null), mouseout: () => setHoveredId(null) }}>
                <Tooltip direction="top" offset={[0, -16]}>
                  {place.label}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
          <button
            type="button"
            onClick={onBackToList}
            className="absolute top-4 right-4 z-[1000] flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-lg transition-all hover:text-primary hover:shadow-xl"
          >
            <List className="h-4 w-4" /> Back to list
          </button>
        </div>
      </div>
    </div>
  )
}
