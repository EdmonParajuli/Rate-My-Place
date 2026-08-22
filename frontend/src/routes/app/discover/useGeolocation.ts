import { useState } from "react"

type Coords = { latitude: number; longitude: number }

// No reverse-geocoding exists (no "Brooklyn, NY"-style location pill) - this
// only ever feeds listPlaces' `near` argument for the NEAREST sort.
export function useGeolocation() {
  const [coords, setCoords] = useState<Coords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)

  // Returns a promise so callers that need to branch on the outcome (e.g.
  // the map view's allow/deny gate) can await it directly, instead of
  // watching coords/error state land asynchronously after the click.
  const request = (): Promise<Coords | null> => {
    if (!navigator.geolocation) {
      setError("Location isn't available in this browser.")
      return Promise.resolve(null)
    }
    setRequesting(true)
    setError(null)
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next = { latitude: position.coords.latitude, longitude: position.coords.longitude }
          setCoords(next)
          setRequesting(false)
          resolve(next)
        },
        (err) => {
          // Once a user has explicitly denied the browser's permission
          // prompt, no amount of re-calling getCurrentPosition can re-open
          // it - browsers block JS from re-prompting after an explicit deny
          // (a security measure, not a bug here). A "Retry" click in that
          // state just silently fails again with the same PERMISSION_DENIED
          // code, which looks like the button does nothing unless we spell
          // out that it has to be re-enabled from the browser's own site
          // settings, not from inside the page.
          setError(
            err.code === err.PERMISSION_DENIED
              ? "Location is blocked for this site. Click the location icon in your browser's address bar (or open its site settings) to allow it, then try again."
              : "Couldn't get your location - check your connection and try again."
          )
          setRequesting(false)
          resolve(null)
        },
        { timeout: 10000 }
      )
    })
  }

  return { coords, error, requesting, request }
}
