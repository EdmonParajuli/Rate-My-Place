# Discover screen

Type: prototype
Status: closed
Claimed by: current session, 2026-08-12
Blocked by: [Design tokens](01-design-tokens.md)

## Question

What should the Discover screen look like and behave like, matching Figma — hero
search with location, filter panel, sort tabs, business card grid with empty state,
plus horizontal strips?

Backend support already exists for all of this via `listPlaces` (see
`src/graphql/typeDefs/placeTypeDefs.ts`): filters (category, price range, min rating,
"open now"), sorts (`HIGHEST_RATED`/`TRENDING`/`NEW`/`NEAREST` via `PlaceSortEnum`),
cursor pagination. This ticket is purely "how does it look/behave," not "does the data
exist."

Two things explicitly **out of scope**, decided during this map's charting session —
don't design for them:
- The "Recommended" strip — dropped entirely, no recommendation engine exists. Ship
  Trending + New Nearby (both real sorts) instead.
- The save/heart toggle on business cards — omitted entirely, Saved Places is
  Phase 5. No disabled/stub icon either.

Use `/prototype` (UI branch) grounded in the Figma nodes for this screen
(`get_design_context`, `figma-design-to-code` skill, fileKey
`uecnUKqT4CI7LuIpWo50Pp`).

## Resolution

**Verdict: A (default) + C (via toggle), B dropped.** A is the primary Discover
layout — dark hero-gradient search, collapsible top filter panel, sort tabs, grid
+ Trending + New Nearby strips. A real "See in map" button (top-right of "All
Places / Sorted by") switches to C — a map+list split view with a reciprocal
"Back to list" button (top-right of the map). Map pins show a hover tooltip with
the place's photo + name. Map library: **Leaflet + OpenStreetMap** (no API key,
no backend work — `listPlaces` already returns lat/lng), recorded in
`docs/05-frontend-plan.md` and `docs/04-roadmap.md` Phase 4.

Card badges grounded in real backend fields only (`Place.isVerified`,
`Place.trending_score`); price range shipped as 3 tiers matching the actual
`price_range` enum, not the real source's 4; save/heart icon and "Recommended"
section both omitted per this map's standing decisions.

Prototype committed to throwaway branch `prototype/discover-screen` (commit
`9c6b40a`), out of `main` per the prototype skill's capture step.

## Comments

**Build (2026-08-12)**: grounded directly in the real `DiscoverScreen`/
`BusinessCard` source (fileKey `uecnUKqT4CI7LuIpWo50Pp`, `App.tsx` ~lines
242-451), re-verified directly rather than trusting the ticket-01 research
summary further (that research already turned out to have at least one real
error, caught on the Authenticated shell ticket).

Decisions made while grounding, not silently ported:
- **Save/heart icon removed** — real source has one on every card; omitted per
  this map's charting decision.
- **"Recommended For You" section removed** — real source has one (a client-
  side category filter, not real personalization); dropped per this map's
  charting decision, no recommendation engine exists.
- **Price range: 3 tiers, not 4** — the real source's filter shows
  $/$$/$$$/$$$$, but the actual backend `price_range` enum is
  `LOW`/`MEDIUM`/`HIGH` (3 tiers, `docs/03-architecture.md`). Ported as 3
  buttons — a 4th button with no backend value to send would be a UI lie.
- **Card badges grounded in real backend fields, not fabricated categories** —
  the source has 4 badge variants ("Top Rated"/"Trending"/"Community
  Favorite"/"Rising Star"), two of which have no backend basis at all. Kept
  only "Verified" (`Place.isVerified`, a real column) and "Trending"
  (`Place.trending_score`, a real materialized column from Phase 3) — both
  backed by fields that actually exist.
- Sort tabs (Highest Rated/Trending/New/Nearby) kept as a faithful 1:1 port of
  the real `PlaceSortEnum` — no discrepancy there.

3 structurally different variants, all with working search/filter/sort logic
(not just static mockups):
- **A** — faithful adaptation: dark hero-gradient search section (the source's
  own real gradient), collapsible top filter panel, sort tabs, full-width grid
  + Trending strip + New Nearby strip.
- **B** — persistent left filter sidebar instead of a collapsible top panel,
  always visible on desktop; main content scrolls independently.
- **C** — map-forward split view: a static map placeholder with pins (ties to
  the real lat/lng + Haversine "Nearby" capability neither A nor B represents
  visually) alongside a narrower scrolling list column.

Prototype: `.scratch/phase-4-frontend-mvp/prototypes/discover-screen/index.html`
(`?variant=A/B/C`).

**Rehosted + refined (2026-08-12)**: rebuilt inside the exact approved shell from
the Authenticated shell layout ticket (pulled verbatim from throwaway branch
`prototype/authenticated-shell`, not retyped) rather than floating standalone —
per `/prototype`'s UI.md guidance, a UI prototype is much easier to judge butting
up against real chrome. Also converged the direction beyond a simple pick-one:

- **A and C used together, not one chosen over the other.** A (list + filters) is
  the default. A real "See in map" button (top-right of "All Places / Sorted by")
  switches to C (map split view); C has a reciprocal "Back to list" button
  top-right of the map. **Variant B (persistent sidebar) dropped entirely**,
  markup removed.
- Map pins now show a hover tooltip with the place's photo + name.
- **Map library decided: Leaflet + OpenStreetMap** — no API key/billing account
  needed, matches this project's "start simple" pattern
  ([07-geo-and-location-strategy.md](../../../docs/07-geo-and-location-strategy.md)'s
  Haversine-over-PostGIS reasoning). No new backend work — `listPlaces` already
  returns real lat/lng per place. Recorded in
  [05-frontend-plan.md](../../../docs/05-frontend-plan.md) (stack) and
  [04-roadmap.md](../../../docs/04-roadmap.md) Phase 4 (flagged as new scope,
  since a map view wasn't part of this ticket's original Question). The
  prototype's map area itself stays a static placeholder with mock pins — real
  Leaflet integration is implementation work, not something to fake convincingly
  here.
