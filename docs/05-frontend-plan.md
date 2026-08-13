# Frontend Plan

**Scaffold done (2026-08-13)**: `frontend/` exists — Vite + React + TypeScript +
Tailwind CSS v4 + shadcn/ui (Radix base) + React Router + Apollo Client + GraphQL
Code Generator (typed hooks, verified against the live backend schema) + React
Hook Form + Zod, all installed and wired together (not just installed
side-by-side — a real query round-trips through a codegen-generated hook against
the running backend). No real screens yet — that's the next work. See
`frontend/README.md` for exact commands and three version-pinning workarounds
hit during setup (Node/Vite/Apollo Client version mismatches with the current
toolchain generation), documented there rather than repeated here.

**Design tokens wired in (2026-08-13)**: `frontend/src/index.css` now carries
the real extracted values (colors, radius, both fonts) instead of shadcn/ui's
default theme — see [Design tokens](#design-tokens) below for the full
picture, including a gap this pass closed: the original research
(`.scratch/phase-4-frontend-mvp/research/design-tokens.md`) could only capture
a subset of the real `theme.css`'s CSS variables (the "headline" tokens), not
the complete file — re-fetched live from the Figma Make source this pass
rather than guessing at the untracked ones (`--popover`, `--card-foreground`,
`--input`, etc.).

This doc otherwise remains the recommendation this scaffold started from — flag
disagreement early since it's much cheaper to change before more code exists
than after.

**Framework decision: plain React, not Next.js.** An earlier draft of this doc
recommended Next.js for its server-rendered marketing pages and SEO story. That's been
overridden — this is a React SPA (built with Vite), full stop. The tradeoff being
accepted knowingly: no server rendering, so the logged-out marketing/landing page won't
be search-engine-friendly out of the box. If SEO on that page matters later, it's an
add-on (prerendering, or a separate static page) rather than a framework swap.

## Repo shape

**Done (2026-08-13)**: the restructuring below has been carried out — `backend/`
exists with everything that used to live under repo-root `src/`, verified
building/running/migrating correctly from its new location. `frontend/` is not
yet scaffolded.

Monorepo, single Git repo, two independent apps side by side:

```
Rate My Place/
  backend/     # everything that exists today under src/, moved as-is
  frontend/    # new React app
  docs/        # shared, stays at root
  CLAUDE.md, README.md
```

This answers Open Question 1 from [04-roadmap.md](./04-roadmap.md): monorepo, because
it's a solo project and sharing the GraphQL schema with codegen (below) is much easier
when both apps sit in one working tree — codegen just points at
`../backend/src/graphql` or a running local server, no cross-repo publishing step.

**Migration mechanics** (do this before writing any frontend code):
- `git mv src package.json package-lock.json tsconfig.json .sequelizerc backend/`,
  plus `.env`/`.env.example` (backend's env vars are DB/JWT/app config — all
  backend-only today).
- `.sequelizerc`'s paths are relative to the cwd `sequelize-cli` runs from, so they
  don't need edits as long as backend commands run with `backend/` as the working
  directory (`npm --prefix backend run db:migrate`, or `cd backend && npm run
  db:migrate`).
- `dist/` and `node_modules/` are gitignored and untracked, so `git mv` won't touch
  them — regenerate with `npm run build`/`npm install` inside `backend/` after the
  move.
- `.gitignore`'s patterns (`dist`, `node_modules`, `.env`, etc.) have no leading `/`,
  so they already match at any depth — no gitignore changes needed once the same
  entries need to apply under both `backend/` and `frontend/`.
- Update `CLAUDE.md`'s Commands section afterward to `cd backend` first (or use
  `npm --prefix backend ...`), since every documented command currently assumes repo
  root == backend root.
- No root `package.json`/npm workspaces — two independent `package.json`s. A shared
  workspace root buys single-`npm install` convenience but nothing else here (no
  shared internal packages to link), and it's one more thing to keep in sync between
  Node/npm versions across two apps that don't otherwise depend on each other.

## Recommended stack

- **Vite + React + TypeScript** — Vite is the standard build tool for a React SPA
  now that Create React App is unmaintained: native-ESM dev server, fast HMR, and
  TypeScript support with effectively no config. TypeScript matches the backend and
  is required for GraphQL codegen (below) to be worth anything.
- **React Router** — client-side routing and nested layouts. This is what replaces
  Next.js's file-based App Router: the logged-out marketing shell and the
  authenticated shell (sidebar nav + top bar, per the Figma design) become two
  layout routes, with `discover`/`categories`/`reviews`/`saved`/`notifications`/
  `profile`/`settings`/`dashboard` nested under the authenticated one. A `<PrivateRoute>`
  wrapper checked against auth state gates the authenticated branch.
- **Tailwind CSS + shadcn/ui** — unaffected by the Next.js→Vite change; shadcn/ui
  ships an official Vite install path. The Figma design (rounded cards, badges,
  toggle switches, dark-gradient hero, sidebar nav) reads as exactly the visual
  language shadcn/ui + Tailwind produces by default — matching it will be fast
  rather than fighting the design system.
- **Apollo Client** — the backend is GraphQL-only (`@apollo/server` +
  `@apollo/subgraph`), so the data layer should be too. Apollo Client's normalized
  cache gives cheap optimistic updates, which the design leans on heavily (helpful-
  vote toggle, save/heart toggle). `urql` is a lighter alternative if the cache
  machinery ever feels like overkill, but there's no reason to start there.
- **GraphQL Code Generator** — generate TypeScript types and typed Apollo hooks
  directly from the backend schema (introspection is already enabled in
  `backend/src/server.ts`). Wire this up immediately, not deferred — with a GraphQL-first
  backend it removes an entire class of frontend/backend drift bugs for free, and
  it's cheapest to set up before the first query is hand-typed.
- **React Hook Form + Zod** — form state (signup, login, write/edit review, settings
  forms) without re-rendering the whole form per keystroke, plus schema validation
  that mirrors the backend's Joi schemas (`backend/src/validators/schemas.ts`) closely enough
  in spirit that the two are easy to keep in sync by inspection.
- **Recharts** — the design's dashboard already specifies AreaChart/BarChart by name
  in the Figma reasoning output; Recharts is what generated those, so using it avoids
  re-deriving the same visuals in a different chart library. (Phase 6, not MVP —
  listed here so the dependency choice is made once.)
- **Leaflet + OpenStreetMap** (`react-leaflet`) — the Discover screen's map view
  (confirmed while prototyping ticket `05-discover-screen.md`: a "See in map" toggle
  next to the results list, switching to a map+list split view) needs a real map.
  Chosen over Google Maps/Mapbox because it needs no API key and no billing-enabled
  account — Leaflet renders the map, OpenStreetMap supplies the free tile imagery
  underneath it. Matches this project's established "start simple, upgrade later"
  pattern (the same reasoning [07-geo-and-location-strategy.md](./07-geo-and-location-strategy.md)
  used to justify Haversine over PostGIS). Wiring it up is low-risk either way: the
  backend already returns real `latitude`/`longitude` per place
  (`listPlaces`/`near: GeoInput`), so the map only needs a marker per place plus a
  click handler syncing the selected pin with the list — no new backend work.
- **No global state library yet.** Apollo's cache covers server state; local UI state
  (filter panel draft values, sidebar collapse, theme) is small enough for plain
  `useState`/React Context at MVP scope. Don't add Zustand/Redux preemptively — add
  it if a real cross-cutting state need shows up.
- **Vitest + React Testing Library** for component tests with real logic (filter
  panel, save toggle, review form validation) — not for every presentational
  component. **Playwright** for the handful of end-to-end flows that actually matter
  (signup → login → write a review → business responds). Same philosophy as
  [06-quality-and-ops.md](./06-quality-and-ops.md), tool choice unaffected by the
  Next.js→Vite change.

## Structure sketch

```
frontend/
  src/
    routes/
      marketing/            # logged-out landing page
      app/                  # authenticated shell layout: sidebar nav + top bar
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
      graphql/              # codegen output: generated types + hooks
      auth/                 # token storage, refresh handling
    styles/
      tokens.css            # design tokens pulled from Figma (color, spacing, radius)
    App.tsx                 # <RouterProvider>
    main.tsx                # ReactDOM.createRoot entry point
  index.html
  vite.config.ts
  tailwind.config.ts
  tsconfig.json
  package.json
```

## Auth on the frontend

The backend returns an access token + refresh token pair from `login`/`signUp` in the
response body (`backend/src/graphql/resolvers/authResolver.ts`) — there's no cookie
handling on the server today (`backend/src/server.ts`'s Apollo context reads only the
`Authorization` header). Two things worth deciding deliberately:

- **Where the refresh token lives.** The original Next.js draft of this plan assumed
  a thin Next.js route handler could set an httpOnly cookie without touching the
  backend. Without Next.js, that option only exists if the Express backend itself is
  changed to set/read cookies (`res.cookie`, `cookie-parser`, CORS `credentials:
  true`, and a CSRF story since cookie-authenticated GraphQL mutations become
  CSRF-able) — a real backend change, not a frontend-only one, so it shouldn't be
  taken on silently as part of frontend scaffolding.
  - **MVP recommendation:** keep the current body-based token contract. Hold the
    access token in memory only (React context, not `localStorage`) so it doesn't
    survive an XSS payload reading storage; hold the refresh token in `localStorage`
    for now so a page reload doesn't force a re-login, accepting that this is the
    weaker option XSS-wise. Revisit as part of Phase 9 hardening if this product
    handles anything sensitive enough to justify the backend cookie work.
- **Session table dependency.** The Settings screen's "active sessions with revoke"
  feature needs the backend `SESSIONS` table from [04-roadmap.md](./04-roadmap.md)
  Phase 1 (already shipped) — sequence the frontend Settings screen build normally,
  no blocker there.

### Business-owner signup: a wizard, not a single step

**New scope, surfaced 2026-08-12** while designing the Phase 4 Auth screens
(prototype at `.scratch/phase-4-frontend-mvp/prototypes/auth-screens/index.html`,
ticket `03-auth-screens.md`): choosing "Business owner" on signup expands the flow
into a short two-step wizard — step 1 collects the usual account fields (name,
email, password), step 2 collects the place's own details (name, category, address,
phone, website, price range) — rather than ending signup at just the account.

This is driven directly by the backend decision (see
[03-architecture.md](./03-architecture.md)) to make account + place creation one
atomic transaction via a new `signUpBusiness` mutation: **nothing is submitted to
the API until the wizard's final step**. Both steps stay client-side-only state
(no partial account is ever created) until the whole payload — account fields +
place fields — goes out in a single `signUpBusiness` call. This sidesteps the
"business-type user with no place yet" gap that chaining two separate existing
calls (`signUp` then `createPlace`) would have left if a user dropped off between
them.

REGULAR signup is unaffected — it stays the single-step flow already designed
(account fields only, `signUp` mutation, no wizard).

## Design tokens

**Done (2026-08-13)**. Pulled the actual values (colors, gradient stops, spacing
scale, border radii, font stack) directly from the Figma Make source's own
generated files (`src/styles/theme.css`, `fonts.css`, `App.tsx`) rather than
eyeballing them off screenshots — confirmed, byte-exact values, not
approximated hex codes.

- **Colors + radius**: `frontend/src/index.css`'s `:root`/`.dark` blocks now
  carry the real values (`--primary: #2563EB`, `--radius: 0.75rem`, etc.)
  instead of shadcn/ui's default theme, verified present in a real production
  build's output CSS.
- **Fonts**: Plus Jakarta Sans (headings) + Manrope (body), self-hosted via
  `@fontsource-variable/*` (matching this scaffold's existing no-CDN-fonts
  convention, not the source's Google Fonts `<link>`) — centralized as
  `--font-heading`/`--font-sans` tokens rather than the source's per-component
  inline `style={{fontFamily}}` pattern, since this project already applies
  fonts via Tailwind's `font-sans` utility.
- **Hero gradient**: exact (`bg-gradient-to-br from-slate-900 via-blue-950
  to-slate-900` + two radial accent blooms), captured as a reusable
  `.hero-gradient` utility class rather than re-derived per screen.
- **Category accent colors**: exact per-category gradient/bg/icon-color data,
  captured in `frontend/src/lib/categoryStyles.ts` (literal Tailwind utility
  class names — Tailwind's built-in palette, not custom CSS tokens, so
  nothing needed adding to `index.css` for these).
- **`shadow-blue` resolved**: the original research flagged this as an
  unresolved custom shadow value. It isn't one — `shadow-md shadow-blue-200`
  in the source is just two standard Tailwind v4 utilities composed together
  (elevation + Tailwind's built-in colored-shadow utility), no custom
  `--shadow-blue` token needed at all.
- **Full variable list gap closed**: the original research
  (`.scratch/phase-4-frontend-mvp/research/design-tokens.md`) referenced "the
  full variable list... copy directly... to avoid transcription drift" but
  only actually captured a subset (the ancillary tokens - `--popover`,
  `--card-foreground`, `--input`, `--input-background`, `--switch-background`,
  `--font-weight-medium/normal` - were never persisted). Re-fetched the
  complete, real `theme.css` live from the Figma Make source this pass rather
  than guessing at those.
