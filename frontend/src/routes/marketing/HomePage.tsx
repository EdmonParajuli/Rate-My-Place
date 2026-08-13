import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { usePlatformStatsQuery } from "@/lib/graphql/generated/graphql"
import { CATEGORY_STYLES } from "@/lib/categoryStyles"

// Proves the scaffold's full chain end-to-end (Tailwind + the real extracted
// design tokens, shadcn/ui, Apollo Client, and a codegen-generated hook
// fetching real data from the running backend) - not the real marketing
// landing page, which is separate, not-yet-built screen work.
export function HomePage() {
  const { data, loading, error } = usePlatformStatsQuery()

  return (
    <main className="flex min-h-svh flex-col items-center gap-8 px-6 py-12">
      <div className="hero-gradient w-full max-w-3xl rounded-2xl px-8 py-10 text-center text-white">
        <p className="relative text-xs font-bold uppercase tracking-widest text-amber-400">Design tokens check</p>
        <h1 className="relative mt-2">Rate My Place</h1>
        <p className="relative mt-2 text-sm text-slate-300">
          Heading font is Plus Jakarta Sans; this paragraph is Manrope (the body font).
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        {loading && "Loading platform stats..."}
        {error && `Error: ${error.message}`}
        {data && `${data.platformStats?.data?.totalPlaces} places, ${data.platformStats?.data?.totalReviews} reviews`}
      </p>

      <Button asChild>
        <Link to="/login">Sign in / Sign up</Link>
      </Button>

      <div className="flex flex-wrap justify-center gap-2">
        {Object.entries(CATEGORY_STYLES).map(([name, style]) => (
          <span
            key={name}
            className={`rounded-full bg-gradient-to-br ${style.gradient} px-3 py-1 text-xs font-semibold text-white`}
          >
            {name}
          </span>
        ))}
      </div>
    </main>
  )
}
