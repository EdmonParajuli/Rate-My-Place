# Map: Phase 4 Frontend MVP Spec

**✅ Destination reached (2026-08-13)** — [docs/specs/phase-4-frontend-mvp.md](../../docs/specs/phase-4-frontend-mvp.md)
is written, synthesizing all 8 closed tickets below. This map is done; nothing
further to work here.

## Destination

`docs/specs/phase-4-frontend-mvp.md` — a spec for [04-roadmap.md](../../docs/04-roadmap.md)
Phase 4, in the same style as `phase-1-backend-hardening.md` /
`phase-3-discovery.md` (decisions-locked-in table, open-questions-resolved,
screen-by-screen detail mapped to the existing GraphQL API). It sits on top of
[05-frontend-plan.md](../../docs/05-frontend-plan.md) (stack/repo-shape, already
decided, not reopened here) and resolves what's still open for Phase 4 specifically:
which screens ship, what each needs from the API, and where the Figma design shows
something the backend doesn't support yet.

Once every ticket below is closed, synthesize the spec doc from this map's Notes +
closed tickets — that synthesis is the destination itself, not a further ticket.

## Notes

- **Domain**: two-sided reviews marketplace — regular users review places, business
  owners manage listings and reply. See root `CLAUDE.md` and
  [01-vision-and-scope.md](../../docs/01-vision-and-scope.md).
- **Figma source**: Make prototype at
  `https://www.figma.com/make/uecnUKqT4CI7LuIpWo50Pp/Rate-My-Business-UI-UX-Design`
  — fileKey `uecnUKqT4CI7LuIpWo50Pp`. Figma Make files always use `nodeId "0:1"` for
  `get_design_context` (the only supported read tool for `/make/` URLs —
  `get_metadata`/`get_screenshot` don't work on them). Load the
  `figma-design-to-code` skill before any `get_design_context` call.
- **Skills every session should consult**: `/grilling` + `/domain-modeling` for
  decision tickets, `/prototype` (UI branch, `UI.md`) for the screen tickets —
  note `/prototype` has `disable-model-invocation: true`, so it needs an actual
  human-present session, not an agent inferring intent alone.
- **Standing decisions, locked in before this map existed** (full detail in
  [05-frontend-plan.md](../../docs/05-frontend-plan.md), not reopened by this map):
  - React SPA via **Vite**, not Next.js — no server rendering.
  - Monorepo: `backend/` (today's code, moved as-is) + `frontend/` (new) side by
    side at repo root, no npm workspaces.
  - Auth token storage (MVP): access token in memory only, refresh token in
    `localStorage`; httpOnly cookies deferred to Phase 9 hardening.
- **Scope decisions locked in while charting this map** (2026-08-11 session):
  - My Reviews stats (total reviews / helpful votes / businesses reviewed)
    computed **client-side** from the full `myReviews` list — no backend aggregate
    query. "Elite" level dropped — Phase 5 badges concept, doesn't exist.
  - Owner replies (`createReviewReply`) **included** in Phase 4 place detail, not
    deferred to Phase 6 — mutation already exists, low incremental cost.
  - BUSINESS-type users get the **same authenticated shell** as REGULAR users in
    Phase 4 — no dashboard placeholder to build and discard later.
  - Password reset UI **deferred to Phase 7** — Phase 4 auth is signup + login only,
    even though the backend already supports forgot/reset.
  - Save/heart icon **omitted entirely** from Phase 4 cards — Saved Places is
    Phase 5, no dead UI affordances.
  - Discover's "Recommended" strip **dropped** for Phase 4 — no recommendation
    engine exists; Trending and New Nearby (both real `listPlaces` sorts) ship.
  - Category business-count / avg-rating fields **deferred past Phase 4** — the
    `Category` GraphQL type doesn't expose them; category cards ship without those
    two numbers for now. **Reversed 2026-08-12** on the Categories screen ticket —
    see that ticket's entry below; the backend now gains a `coverImageUrl` field
    and live `businessCount`/`avgRating` computed fields instead.
  - Logged-out **marketing/landing page included** in Phase 4 scope (hero, stats
    strip, testimonials, CTA) — it's a fully-designed Figma screen (Version 2) and
    doc 5's structure sketch already assumes a marketing route exists.

## Decisions so far

- [Design tokens](tickets/01-design-tokens.md) — extracted from the Figma Make
  file's actual generated source (not screenshots): default shadcn/ui light theme
  (primary `#2563EB`, accent `#F59E0B`), a one-off hero gradient
  (`slate-900`→`blue-950`→`slate-900` + radial accent blooms) rather than a global
  dark theme, exact 10-category accent-color set, Plus Jakarta Sans + Manrope fonts,
  `0.75rem`-based radius scale, and confirmation the sidebar nav should reuse
  shadcn/ui's stock `Sidebar` primitive (16rem/3rem/18rem widths). Also
  cross-validated `05-frontend-plan.md`'s stack picks (react-router, react-hook-form,
  recharts, Tailwind v4 all present in the source) and surfaced lucide-react as the
  icon set. Full detail: [research/design-tokens.md](research/design-tokens.md).
  **Caveat for the Marketing and Auth tickets**: this fetch only covered the
  authenticated "core app" screens — no marketing/auth/place-detail screen was in
  the source tree fetched, so those tickets need their own look at where that
  content lives in the Figma Make project rather than assuming this same fetch
  covers them.
- [Marketing landing page](tickets/02-marketing-landing-page.md) — located
  "Version 2" as a genuinely separate Figma Make file (fileKey
  `oVTXc2TbEHvaGM5mVXL6L1`; `01-vision-and-scope.md`'s "empty/unstarted" note about
  this fileKey is now stale). Stats strip confirmed hardcoded marketing copy, not a
  backend query. Real source's hero is light-themed, not dark-gradient as doc 1
  describes — 3 variants built exploring both readings; **Variant B chosen**:
  dark-gradient hero (ticket 01's real token) with stats embedded in it, a dual-path
  reviewer/business chooser as the primary section, horizontal-scroll trending
  strip, condensed features, CTA banner. Side finding: no auth-screen Figma source
  exists in either file — flagged on the Auth screens ticket.
- [Auth screens](tickets/03-auth-screens.md) — no Figma source exists for
  signup/login in either Figma Make file, so this was a from-scratch composition on
  the extracted design tokens, not a port. **Variant A chosen**: split-screen, dark
  hero-gradient panel with a rotating testimonial carousel, REGULAR/BUSINESS as
  selectable icon cards inside the signup form. Also decided: business-owner
  signup expands into a two-step wizard (account → place details) submitted
  together via a new atomic `signUpBusiness` mutation, rather than ending signup
  at just the account — this fed back into the permanent project docs (not just
  this map): [04-roadmap.md](../../docs/04-roadmap.md) Phase 4,
  [03-architecture.md](../../docs/03-architecture.md) (backend shape),
  [05-frontend-plan.md](../../docs/05-frontend-plan.md) (frontend wizard
  behavior).
- [Authenticated shell layout](tickets/04-authenticated-shell.md) — **correction
  to ticket 01's research**: the real sidebar is a hand-rolled fixed `w-60`
  `<aside>`, not the shadcn/ui `Sidebar` primitive as ticket 01 claimed, and has
  zero responsive/mobile handling in the source. **Variant A chosen**: only the 3
  Phase-4 nav items exist (Saved/Notifications/Profile/Settings fully absent, not
  locked), mobile hamburger + slide-over added to fill the source's mobile gap,
  plus (via live refinement) a desktop collapse-to-icon-only toggle with hover
  tooltips, smooth label transitions, and a real "Log out" affordance.
- [Discover screen](tickets/05-discover-screen.md) — rehosted inside the exact
  approved shell from the Authenticated shell layout ticket (pulled verbatim, not
  retyped). **A + C used together, B dropped**: A (list + filter panel) is the
  default, a real "See in map" button switches to C (map split view with hover
  tooltips on pins), C has a reciprocal "Back to list" button. Map library
  decided: **Leaflet + OpenStreetMap** — no API key, no new backend work
  (`listPlaces` already returns lat/lng) — recorded in
  [04-roadmap.md](../../docs/04-roadmap.md) Phase 4 (flagged as new scope) and
  [05-frontend-plan.md](../../docs/05-frontend-plan.md) (stack). Card badges
  grounded in real backend fields only (`isVerified`/`trending_score`); price
  range shipped as 3 tiers matching the real enum, not the Figma source's 4.
- [Categories screen](tickets/07-categories-screen.md) — **Variant A chosen**:
  card grid + click-through category-detail sub-screen, matching Figma exactly
  (cover photo, gradient overlay, "N businesses · X★ avg"). This **reversed** an
  earlier no-photo/no-count decision made on this same ticket (see Standing
  decisions above) — backend gains new scope: `coverImageUrl` on `Category`
  (seed-managed) plus live-computed `businessCount`/`avgRating` (matches the
  `Place.averageRating` precedent, not materialized) — full shape in
  [03-architecture.md](../../docs/03-architecture.md), flagged in
  [04-roadmap.md](../../docs/04-roadmap.md) Phase 4. **Addendum, after this
  ticket closed**: the platform-wide stats row ("56,700+ Total Businesses / 10
  Categories / 14M+ Reviews") got reversed back in too — same call, needs a new
  `totalPlaces`/`totalReviews` query, also now in 03-architecture.md.
- [My Reviews screen](tickets/08-my-reviews-screen.md) — resolved this ticket's
  own flagged open question (Published/Drafts tabs, no backend draft concept
  exists) by building both answers as variants and letting it be chosen live.
  **Variant B chosen**: Drafts tab kept, but explicitly client-side/this-device-
  only (`localStorage`, never sent to the API), with a visible note saying so.
  Stats reduced to 3 cards (Total Reviews/Helpful Votes/Businesses, "Elite"
  dropped); review photos removed (Phase 8 Media); Edit wired to a real inline
  star+textarea form; Delete gets a confirm step.
- [Place detail + write/edit review](tickets/06-place-detail-review.md) — a real,
  complete `PlaceDetailScreen` appeared in the Figma source on 2026-08-13 (didn't
  exist the day before — worth remembering the resource listing alone doesn't
  reliably rule a screen out, a full re-fetch does). **Variant A chosen**:
  faithful port, full cover + two-column body. **Critical note for the real
  build**: the visitor/owner toggle is a demo-only device (the real source's own
  code labels it that way) — production must derive viewer mode from
  `currentUser.id === place.owner.id`, never a user-facing switch. Gaps
  reconciled: cover/logo photos → generic placeholder (Phase 8 Media); amenity
  pills → illustrative placeholder, given its own new
  [Phase 10](../../docs/04-roadmap.md); owner response-rate → placeholder text
  (overlaps Phase 6's undecided formula). Backend follow-ups now recorded in
  [03-architecture.md](../../docs/03-architecture.md)'s "Planned: Place Detail
  follow-ups": `ReviewReply.createdAt`, a `sort` arg on `placeReviews`, a live
  rating-breakdown aggregate.

This was the last open ticket on this map — every ticket is now closed. Remaining
work is synthesizing the final spec doc (see Destination) from this map's Notes +
closed tickets; not itself a ticket.

## Not yet specified

- Exact GraphQL operation list and route paths per screen — deferred until each
  screen's Prototype ticket fixes what's actually shown; write these into the spec
  doc during final synthesis, not as a separate decision.

## Out of scope

- Saved Places, Notifications, Profile (stats/activity chart/badges), Settings,
  Business Dashboard, Media/photo upload — all explicitly Phase 5-8 in
  [04-roadmap.md](../../docs/04-roadmap.md), not Phase 4.
- Repo restructuring execution (`git mv` into `backend/`/`frontend/`) and actual
  project scaffolding — already **decided** (see Standing decisions above), but
  *doing* it is implementation, not a decision this map produces.
