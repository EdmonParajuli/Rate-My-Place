# Frontend Plan

No frontend code exists yet. This is a recommendation to start from, not a decision
already made — flag disagreement early since it's much cheaper to change before code
exists than after.

## Recommended stack

- **Next.js (App Router) + TypeScript** — the Figma prototype's screen set (landing
  page + authenticated app with client-heavy interactivity) fits Next.js's mix of
  server-rendered marketing pages and client-rendered app screens better than a plain
  SPA, and it's the path of least resistance for later SEO on the Discover/place-detail
  pages, which matter for a reviews product.
- **Tailwind CSS + shadcn/ui** — the Figma design (rounded cards, badges, toggle
  switches, dark-gradient hero, sidebar nav) reads as exactly the visual language
  shadcn/ui + Tailwind produces by default; matching it will be fast rather than
  fighting the design system.
- **Recharts** — the design's dashboard already specifies AreaChart/BarChart by name
  in the Figma reasoning output; Recharts is what generated those, so using it avoids
  re-deriving the same visuals in a different chart library.
- **Apollo Client** (or `urql` if you want something lighter) — the backend is
  GraphQL-only, so the data layer should be too. Apollo Client's cache also gives you
  optimistic updates for cheap (helpful-vote toggle, save/heart toggle) which the
  design leans on heavily.
- **GraphQL Code Generator** (`graphql-codegen`) — generate TypeScript types and typed
  hooks directly from the backend schema. With a GraphQL-first backend this removes an
  entire class of frontend/backend drift bugs for free; wire it up as soon as the
  schema has more than the current two features.

## Structure sketch

```
web/
  app/                    # Next.js App Router routes
    (marketing)/          # logged-out landing page
    (app)/                # authenticated shell: sidebar nav + top bar
      discover/
      categories/
      reviews/
      saved/
      notifications/
      profile/
      settings/
      dashboard/          # business-owner view
  components/
    ui/                   # shadcn/ui primitives
    business-card/
    review-card/
    charts/
  lib/
    graphql/              # generated types + hooks
    auth/                 # token storage, refresh handling
  styles/
    tokens.css            # design tokens pulled from Figma (color, spacing, radius)
```

## Auth on the frontend

The backend returns an access token + refresh token pair from `login`/`signUp`. Two
things worth deciding deliberately rather than defaulting into:

- **Where the refresh token lives.** `localStorage` is the easy path but is readable
  by any injected script (XSS blast radius). An httpOnly cookie set by a thin
  Next.js route handler is more resistant to that, at the cost of the backend needing
  to accept the refresh token via cookie as well as the current request-body shape.
  Worth deciding before building the login screen, since it shapes the API contract.
- **Session table dependency.** The Settings screen's "active sessions with revoke"
  feature needs the backend `SESSIONS` table from
  [04-roadmap.md](./04-roadmap.md) Phase 1 — sequence the frontend Settings screen
  after that lands, not before.

## Design tokens

Pull the actual values (colors, gradient stops, spacing scale, border radii, font
stack) from the Figma file's design panel rather than eyeballing them off screenshots
— Figma Make prototypes are usually generated with a real token layer underneath
(Tailwind config or CSS variables) that's worth extracting directly if the file's
inspect panel exposes it, instead of reverse-engineering approximate hex codes.

## Testing

Component tests (Vitest + Testing Library) for interactive pieces with real logic
(filter panel, save toggle, review form validation) — not for every presentational
component. End-to-end coverage (Playwright) for the handful of flows that actually
matter: signup → login → write a review → business responds. See
[06-quality-and-ops.md](./06-quality-and-ops.md) for the shared testing philosophy.
