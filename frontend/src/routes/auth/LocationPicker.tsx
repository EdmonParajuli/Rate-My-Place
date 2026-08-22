import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { LocateFixed, Maximize2, Minimize2 } from "lucide-react"
import { useGeolocation } from "@/lib/useGeolocation"

// Same divIcon approach as DiscoverPage's MapView - Leaflet's default marker
// image paths don't resolve under Vite's bundling.
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:9999px;background:#2563EB;border:2px solid white;box-shadow:0 2px 6px rgba(15,23,42,0.35);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

const DEFAULT_CENTER: [number, number] = [27.7172, 85.324] // fallback only - used until a location is picked or "Turn on location" resolves
const PICKED_ZOOM = 16

function ClickToPlace({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// MapContainer's `center` prop only applies on first mount (react-leaflet
// doesn't re-read it on prop changes) - re-centering onto a freshly-granted
// geolocation position needs an imperative flyTo on the live map instance.
function FlyTo({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, PICKED_ZOOM)
    }
  }, [position, map])
  return null
}

// A top-level (not nested-in-render) component so its identity is stable
// across LocationPicker re-renders - defining this inline instead would
// make React remount the whole Leaflet map (losing tiles/interaction) on
// every marker update, not just when compact/expanded actually toggles.
function PickerMap({
  marker,
  flyToTarget,
  onPick,
  onMarkerDrag,
}: {
  marker: [number, number] | null
  flyToTarget: [number, number] | null
  onPick: (lat: number, lng: number) => void
  onMarkerDrag: (lat: number, lng: number) => void
}) {
  return (
    <MapContainer center={marker ?? DEFAULT_CENTER} zoom={marker ? PICKED_ZOOM : 12} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToPlace onPick={onPick} />
      <FlyTo position={flyToTarget} />
      {marker && (
        <Marker
          position={marker}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const pos = e.target.getLatLng()
              onMarkerDrag(pos.lat, pos.lng)
            },
          }}
        />
      )}
    </MapContainer>
  )
}

function LocationToolbar({ onUseMyLocation, requesting }: { onUseMyLocation: () => void; requesting: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2">
      <p className="text-xs leading-snug text-blue-700">
        Turn on your location so we can zoom the map to where you are, then tap the map (or drag the pin) to mark your place exactly.
      </p>
      <button
        type="button"
        onClick={onUseMyLocation}
        disabled={requesting}
        className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <LocateFixed className="h-3.5 w-3.5" />
        {requesting ? "Locating..." : "Turn on location"}
      </button>
    </div>
  )
}

// Lets a business owner mark their place's exact location while signing up,
// closing the gap docs/07-geo-and-location-strategy.md left open ("the
// caller supplies latitude/longitude directly" was the assumed design, but
// no UI ever actually collected it - see the conversation that led here).
// Click or drag the pin to set coordinates; "Turn on location" re-centers
// the map on the owner's own position first, as a starting point, not a
// gate - the picker is fully usable without ever granting it. The compact
// inline map can feel cramped for fine placement, so a maximize toggle
// opens the same picker (map + toolbar) full-screen; minimizing keeps
// whatever was picked.
//
// Both map wrappers below carry `isolate` (CSS isolation: isolate) - without
// it, Leaflet's internal panes/zoom-control z-indexes (up to 1000, see
// leaflet.css) aren't contained to this component and render above anything
// on the page with a lower z-index, including the Category field's Select
// dropdown further up this same form (a real bug: the map was rendering on
// top of, hiding, the open category list). `isolate` traps Leaflet's
// stacking inside this wrapper so it can never climb above sibling UI.
export function LocationPicker({
  value,
  onChange,
}: {
  value: { latitude: number; longitude: number } | null
  onChange: (coords: { latitude: number; longitude: number }) => void
}) {
  const geo = useGeolocation()
  const [expanded, setExpanded] = useState(false)
  const marker: [number, number] | null = value ? [value.latitude, value.longitude] : null
  const flyToTarget: [number, number] | null = geo.coords ? [geo.coords.latitude, geo.coords.longitude] : null

  useEffect(() => {
    if (!expanded) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [expanded])

  const handleUseMyLocation = async () => {
    const coords = await geo.request()
    if (coords) {
      onChange(coords)
    }
  }

  const handlePick = (lat: number, lng: number) => onChange({ latitude: lat, longitude: lng })

  if (expanded) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Mark your place's location"
        onClick={() => setExpanded(false)}
      >
        <div
          className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border p-3">
            <div className="min-w-0 flex-1">
              <LocationToolbar onUseMyLocation={handleUseMyLocation} requesting={geo.requesting} />
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Minimize2 className="h-3.5 w-3.5" />
              Done
            </button>
          </div>
          {geo.error && <p className="px-3 pt-2 text-xs font-medium text-amber-700">{geo.error}</p>}
          <div className="relative isolate flex-1">
            <PickerMap marker={marker} flyToTarget={flyToTarget} onPick={handlePick} onMarkerDrag={handlePick} />
          </div>
          <p className="border-t border-border px-3 py-2 text-xs text-slate-500">
            {marker ? "Drag the pin or tap elsewhere to adjust." : "Tap anywhere on the map to mark your place's exact location."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <LocationToolbar onUseMyLocation={handleUseMyLocation} requesting={geo.requesting} />
      {geo.error && <p className="text-xs font-medium text-amber-700">{geo.error}</p>}

      <div className="relative isolate h-56 w-full overflow-hidden rounded-xl border border-border">
        <PickerMap marker={marker} flyToTarget={flyToTarget} onPick={handlePick} onMarkerDrag={handlePick} />
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="Maximize map"
          className="absolute top-2 right-2 z-[1000] flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white text-slate-600 shadow-md transition-colors hover:text-primary"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-slate-500">
        {marker ? "Drag the pin or tap elsewhere to adjust." : "Tap anywhere on the map to mark your place's exact location."}
      </p>
    </div>
  )
}
