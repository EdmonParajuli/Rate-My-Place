// No profile-picture upload flow exists yet - profilePicture is null for
// essentially every real user. Rather than fake a stock photo, unset avatars
// render as initials-in-a-circle. Shared across AppLayout, review cards, etc.
export function UserAvatar({ name, profilePicture, className }: { name: string; profilePicture?: string | null; className: string }) {
  if (profilePicture) {
    return <img src={profilePicture} alt="" className={`${className} object-cover`} />
  }
  const initials = (name || "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return (
    <span className={`${className} flex items-center justify-center bg-primary font-bold text-primary-foreground`}>
      {initials || "?"}
    </span>
  )
}
