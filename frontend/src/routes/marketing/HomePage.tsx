import { Button } from "@/components/ui/button"
import { usePlatformStatsQuery } from "@/lib/graphql/generated/graphql"

// Proves the scaffold's full chain end-to-end (Tailwind, shadcn/ui, Apollo
// Client, and a codegen-generated hook fetching real data from the running
// backend) - not the real marketing landing page, which is separate,
// not-yet-built screen work.
export function HomePage() {
  const { data, loading, error } = usePlatformStatsQuery()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-foreground">Rate My Place</h1>
      <p className="text-muted-foreground">Marketing landing page - not yet built.</p>
      <p className="text-sm text-muted-foreground">
        {loading && "Loading platform stats..."}
        {error && `Error: ${error.message}`}
        {data && `${data.platformStats?.data?.totalPlaces} places, ${data.platformStats?.data?.totalReviews} reviews`}
      </p>
      <Button>shadcn/ui Button</Button>
    </main>
  )
}
