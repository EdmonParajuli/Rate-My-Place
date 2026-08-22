import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { LocateFixed } from "lucide-react"
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

// Lets a business owner mark their place's exact location while signing up,
// closing the gap docs/07-geo-and-location-strategy.md left open ("the
// caller supplies latitude/longitude directly" was the assumed design, but
// no UI ever actually collected it - see the conversation that led here).
// Click or drag the pin to set coordinates; "Turn on location" re-centers
// the map on the owner's own position first, as a starting point, not a
// gate - the picker is fully usable without ever granting it.
export function LocationPicker({
  value,
  onChange,
}: {
  value: { latitude: number; longitude: number } | null
  onChange: (coords: { latitude: number; longitude: number }) => void
}) {
  const geo = useGeolocation()
  const marker: [number, number] | null = value ? [value.latitude, value.longitude] : null
  const flyToTarget: [number, number] | null = geo.coords ? [geo.coords.latitude, geo.coords.longitude] : null

  const handleUseMyLocation = async () => {
    const coords = await geo.request()
    if (coords) {
      onChange(coords)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2">
        <p className="text-xs leading-snug text-blue-700">
          Turn on your location so we can zoom the map to where you are, then tap the map (or drag the pin) to mark your place exactly.
        </p>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={geo.requesting}
          className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {geo.requesting ? "Locating..." : "Turn on location"}
        </button>
      </div>
      {geo.error && <p className="text-xs font-medium text-amber-700">{geo.error}</p>}

      <div className="h-56 w-full overflow-hidden rounded-xl border border-border">
        <MapContainer center={marker ?? DEFAULT_CENTER} zoom={marker ? PICKED_ZOOM : 12} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onPick={(lat, lng) => onChange({ latitude: lat, longitude: lng })} />
          <FlyTo position={flyToTarget} />
          {marker && (
            <Marker
              position={marker}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const pos = e.target.getLatLng()
                  onChange({ latitude: pos.lat, longitude: pos.lng })
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-slate-500">
        {marker ? "Drag the pin or tap elsewhere to adjust." : "Tap anywhere on the map to mark your place's exact location."}
      </p>
    </div>
  )
}
