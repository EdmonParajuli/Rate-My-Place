import { useState } from "react"
import { Heart } from "lucide-react"
import { useToggleSavePlaceMutation } from "@/lib/graphql/generated/graphql"

// Self-contained toggle, same "mutation response drives local state, no
// refetch/cache surgery" shape as ReviewCard's helpful-vote button - the
// mutation already returns the new savedByMe directly, so there's nothing to
// refetch. Reused on Discover's PlaceCard and Place Detail's header.
export function SaveHeartButton({
  placeId,
  initialSaved,
  size = "md",
}: {
  placeId: number
  initialSaved: boolean | null | undefined
  size?: "sm" | "md"
}) {
  const [saved, setSaved] = useState(Boolean(initialSaved))
  const [toggleSavePlace, { loading }] = useToggleSavePlaceMutation()

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await toggleSavePlace({ variables: { placeId } })
    setSaved(Boolean(result.data?.toggleSavePlace?.savedByMe))
  }

  const dimensions = size === "sm" ? "h-8 w-8" : "h-9 w-9"
  const iconSize = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={saved ? "Remove from saved places" : "Save this place"}
      aria-pressed={saved}
      className={`flex ${dimensions} flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <Heart className={`${iconSize} ${saved ? "fill-destructive text-destructive" : "text-slate-500"}`} />
    </button>
  )
}
