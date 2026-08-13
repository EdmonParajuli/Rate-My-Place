import { useState } from "react"

type Coords = { latitude: number; longitude: number }

// No reverse-geocoding exists (no "Brooklyn, NY"-style location pill) - this
// only ever feeds listPlaces' `near` argument for the NEAREST sort.
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)

  const request = () => {
    if (!navigator.geolocation) {
      setError("Location isn't available in this browser.")
      return
    }
    setRequesting(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setRequesting(false)
      },
      () => {
        setError("Couldn't get your location - check your browser's location permission.")
        setRequesting(false)
      },
      { timeout: 10000 }
    )
  }

  return { coords, error, requesting, request }
}
