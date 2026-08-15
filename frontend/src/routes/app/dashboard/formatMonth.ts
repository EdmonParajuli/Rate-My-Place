// businessDashboard's ratingTrend/reviewVolume months come back as "YYYY-MM"
// (an unambiguous API contract) - charts want a short display label instead.
export function monthLabel(isoMonth: string): string {
  const date = new Date(`${isoMonth}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoMonth
  return date.toLocaleDateString("en-US", { month: "short" })
}
