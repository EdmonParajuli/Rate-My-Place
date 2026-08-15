// dayOfWeek follows JS Date.getUTCDay() (0=Sunday..6=Saturday) - matches
// backend/src/utils/businessHours.ts's getCurrentServerDayAndTime exactly.
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MONDAY_FIRST_ORDER = [1, 2, 3, 4, 5, 6, 0]

export function dayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? ""
}

export function sortByDay<T extends { dayOfWeek?: number | null }>(hours: T[]): T[] {
  return [...hours].sort((a, b) => MONDAY_FIRST_ORDER.indexOf(a.dayOfWeek ?? 0) - MONDAY_FIRST_ORDER.indexOf(b.dayOfWeek ?? 0))
}

// "09:00:00" -> "9:00 am"
export function formatTime(time: string | null | undefined): string {
  if (!time) return ""
  const [hourStr, minute] = time.split(":")
  const hour = Number(hourStr)
  const period = hour >= 12 ? "pm" : "am"
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minute} ${period}`
}
