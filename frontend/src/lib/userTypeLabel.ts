export function userTypeLabel(userType: string | null | undefined): string {
  return userType === "BUSINESS" ? "Business owner" : "Reviewer"
}
