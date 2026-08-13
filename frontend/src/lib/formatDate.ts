// GraphQL dates are plain String scalars here (no DateTime scalar exists in
// this schema) - raw epoch-millisecond strings, same convention as
// Session.createdAt/ReviewReply.createdAt/Review.createdAt.
export function formatDate(epochMillisString: string | null | undefined): string {
  if (!epochMillisString) return ""
  const date = new Date(Number(epochMillisString))
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
