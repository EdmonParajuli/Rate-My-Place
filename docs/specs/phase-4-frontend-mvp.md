# Phase 4 Spec: Frontend MVP

**Status: ✅ Design decided, not yet implemented.** Every decision below came out of
a `/wayfinder` map (`.scratch/phase-4-frontend-mvp/MAP.md`, 8 tickets, all closed
2026-08-11 → 2026-08-13) and `/prototype` work — each screen was built as 2-3
structurally different, fully-interactive HTML variants, judged live, with the
chosen variant captured onto its own throwaway git branch (`prototype/<screen>`,
listed per screen below). **No real `frontend/` code exists yet** — this spec is
what to build, not confirmation it's built. Several items surfaced genuinely new
*backend* scope while designing the frontend; those are called out explicitly
below and are also not yet built.

Source: [04-roadmap.md](../04-roadmap.md) Phase 4, [05-frontend-plan.md](../05-frontend-plan.md)
(stack/repo-shape — decided separately, not reopened here), the Figma Make
prototype (`https://www.figma.com/make/uecnUKqT4CI7LuIpWo50Pp/...`, plus a second
file `oVTXc2TbEHvaGM5mVXL6L1` discovered mid-effort to hold the marketing/dashboard
"Version 2" content), and [01-vision-and-scope.md](../01-vision-and-scope.md)'s
screen descriptions. This phase stands up the frontend against Phases 1-3's API —
auth, places, categories, reviews, discovery — the eight screens below are the
full MVP surface; everything else (Saved, Notifications, Profile, Settings,
Business Dashboard, Media) is later phases, see Non-goals.

## Decisions already locked in

| Question | Decision |
|---|---|
| Stack, repo shape, auth token storage | Already decided in [05-frontend-plan.md](../05-frontend-plan.md) — Vite + React (not Next.js), monorepo (`backend/`/`frontend/` split), access token in memory + refresh token in `localStorage`. Not reopened by this spec. |
| Review photos | Out of scope everywhere — Phase 8 Media. Every review form is text + star rating only; every review card renders without a photo section. |
| Save/heart icon | Omitted everywhere — Saved Places is Phase 5. No disabled/stub icon left in its place. |
| Price range | 3 tiers everywhere (`LOW`/`MEDIUM`/`HIGH` → `$`/`$$`/`$$$`), matching the real `PriceRangeEnum` — not the Figma source's 4-tier `$$$$` scale. |
| My Reviews stats | Computed **client-side** from the full `myReviews` list (no `totalCount` on `PageInfo`, no backend aggregate) — fine at MVP review volume. |
| "Elite" level / badges | Dropped entirely — Phase 5 badges concept, no backend support exists. |
| Owner replies | **Included** in Phase 4 place detail, not deferred to Phase 6 — `createReviewReply` already exists, low incremental cost. |
| Business owners' shell | **Identical** authenticated shell to regular users in Phase 4 — no dashboard placeholder to build and discard (Business Dashboard is Phase 6). |
| Password reset UI | **Deferred to Phase 7** — Phase 4 auth is signup + login only, even though the backend already supports forgot/reset end-to-end. |
| Discover's "Recommended" strip | **Dropped** — no recommendation engine exists. Trending + New Nearby (both real `listPlaces` sorts) ship instead. |
| Marketing/landing page | **Included** in Phase 4 scope — a fully-designed Figma screen, and [05-frontend-plan.md](../05-frontend-plan.md)'s structure sketch already assumed a marketing route exists. |
| Map library (Discover) | **Leaflet + OpenStreetMap** — no API key/billing account, matches this project's "start simple" pattern from [07-geo-and-location-strategy.md](../07-geo-and-location-strategy.md). |
| Business-owner signup | Expands into a **two-step wizard** (account → place details), submitted together via a new atomic `signUpBusiness` mutation — not two chained calls to existing `signUp`+`createPlace`. |
| Category business-count / avg-rating | **Included**, matching Figma exactly (reverses an earlier "defer" decision) — new backend scope, see below. |
| Categories platform-wide stats row | **Included**, matching Figma exactly (reverses an earlier "drop" decision) — new backend scope, see below. |
| My Reviews "Drafts" tab | **Kept**, but explicitly **client-side/this-device-only** (`localStorage`, never sent to the API) — a real but limited feature, with a visible note saying so. |
| Place Detail amenity pills | Shown as **illustrative placeholders only** — no backend concept exists; given its own new [Phase 10](../04-roadmap.md), not forced into Phase 4 or dropped permanently. |
| Place Detail owner "response rate" | Shown as **placeholder text, not computed** — the same metric Phase 6's roadmap item already flags as an undecided formula; avoids two screens disagreeing on what it means. |
| Place Detail cover/logo photos | **Generic placeholder**, not a real per-place image — full photo support is Phase 8 Media, real infrastructure, not a one-column addition. |
| Place Detail visitor/owner toggle | **Prototype-only demo device.** In the real system, viewer mode is *always* derived automatically (`currentUser.id === place.owner.id`) — never a user-facing switch. |

## New backend scope surfaced during this phase

Every one of these was discovered while designing a Phase 4 screen against the real
Figma design, reconciled against what the backend actually exposes today. Full shape
for each is in [03-architecture.md](../03-architecture.md)'s "Planned: ..." sections,
linked below. **Status updated as items land** — all 7 are built as of 2026-08-13.

| Addition | Needed for | Status | Detail |
|---|---|---|---|
| `signUpBusiness` mutation (atomic `User` + `Place` creation, one transaction) | Auth screens' business-signup wizard | ✅ Built | [03-architecture.md § signUpBusiness](../03-architecture.md#signupbusiness-atomic-account--place-creation) |
| `Category.coverImageUrl: String` (seed-managed, no new mutation) | Categories screen's cards matching Figma | ✅ Built, unseeded | [03-architecture.md § Category cover image](../03-architecture.md#planned-category-cover-image--live-business-countavg-rating) |
| `Category.businessCount: Int` / `avgRating: Float` (live-computed, not materialized) | Categories screen's cards + category-detail banner | ✅ Built | same section as above |
| `platformStats` query (`totalPlaces`/`totalReviews`, live `COUNT`s) | Categories screen's platform-wide stats row | ✅ Built | [03-architecture.md § platform-wide stats](../03-architecture.md#also-needed-platform-wide-stats-totalplacestotalreviews) |
| `ReviewReply.createdAt: String` | Place Detail's reply timestamps | ✅ Built | [03-architecture.md § Place Detail follow-ups](../03-architecture.md#place-detail-follow-ups-reviewreplycreatedat-review-sort-rating-breakdown) |
| `placeReviews(..., sort: ReviewSortEnum)` (`RECENT`/`HELPFUL`) | Place Detail's review sort tabs | ✅ Built | same section as above |
| `Place.ratingBreakdown: [RatingBreakdownEntry]` (live-computed, `GROUP BY rating`) | Place Detail's rating-overview bar chart | ✅ Built | same section as above |

**`Category.coverImageUrl` note**: the field exists and resolves, but no real URLs
are seeded yet (content decision, separate from the schema addition).

**Category count fixed (2026-08-13)**: the seed data used to have only 5 categories,
not the 10 the Phase 4 frontend design assumes — now fixed, 10 Figma categories +
`Bar` kept as an 11th (no Figma counterpart). `icon` also now holds lucide-react
icon names, matching every prototype, not the original flaticon image URLs. Full
detail, plus a real seeder-idempotency issue found and not yet fixed, in
[03-architecture.md](../03-architecture.md).

**Sequencing implication**: none of these block the *design* work (already done —
every prototype uses illustrative mock data for these fields), but each blocks
wiring its screen to real data. See Suggested build sequencing.

## Screens

Each screen below: chosen variant, what it needs from the GraphQL API, and where the
full design rationale lives (the closed wayfinder ticket has the complete
discrepancy-by-discrepancy reasoning — this section summarizes, doesn't repeat it).

### 0. Design tokens (infrastructure, not a screen)

Colors, fonts, radius scale, and component styles extracted directly from the Figma
Make source's generated code (not eyeballed) — default shadcn/ui theme, primary
`#2563EB`, accent `#F59E0B`, Plus Jakarta Sans (headings) + Manrope (body),
`0.75rem`-based radius scale, lucide-react icon set. Validated via a standalone
reference page before use. Becomes `frontend/`'s Tailwind config + `tokens.css`.

Full detail: [research/design-tokens.md](../../.scratch/phase-4-frontend-mvp/research/design-tokens.md).
Ticket: [01-design-tokens.md](../../.scratch/phase-4-frontend-mvp/tickets/01-design-tokens.md).
Prototype: `prototype/design-tokens-reference` (commit `fac9edb`).

### 1. Marketing / landing page (logged-out)

**Chosen: Variant B.** Dark-gradient hero (`slate-900`→`blue-950`→`slate-900` +
radial blooms) with the stats strip embedded directly in it (5M+ Active Users /
1.2M Businesses Listed / 10M+ Reviews Shared / 98% Satisfaction — **hardcoded
marketing copy, confirmed no backend query backs it, ship it static**), a dual-path
"I'm here to review" / "I run a business" chooser as the primary section below the
hero, a horizontal-scroll trending-places strip, condensed feature copy, a CTA
banner reusing the hero gradient, shared footer.

No GraphQL calls on load (fully static/logged-out). The hero search bar and
trending strip can link into Discover (`listPlaces`) once submitted/clicked, but
don't query anything themselves.

Ticket: [02-marketing-landing-page.md](../../.scratch/phase-4-frontend-mvp/tickets/02-marketing-landing-page.md).
Prototype: `prototype/marketing-landing-page` (commit `1d65535`).

### 2. Auth screens (signup / login) ✅ Built (2026-08-13)

**Chosen: Variant A.** Split-screen: dark hero-gradient left panel with a rotating
testimonial carousel (3 reviews, 5s auto-advance + manual next, avatars), Sign
In/Sign Up tabs in a card on the right. REGULAR/BUSINESS is an inline choice
(two selectable icon cards) inside the signup form — choosing BUSINESS expands
signup into a second step collecting place details (name, category, address,
phone, website, price range), submitted together via `signUpBusiness` (see New
backend scope). Login is a single step, no forgot-password link (Phase 7).

GraphQL: `login`, `signUp` (REGULAR), `signUpBusiness` (BUSINESS, new — see above).

Ticket: [03-auth-screens.md](../../.scratch/phase-4-frontend-mvp/tickets/03-auth-screens.md).
Prototype: `prototype/auth-screens` (commit `519cb0e`).

**Real implementation** (`frontend/src/routes/auth/`): `LoginPage.tsx` (layout +
tabs), `TestimonialCarousel.tsx`, `SignInForm.tsx`, `SignUpForm.tsx` (type cards +
the 2-step BUSINESS wizard, React Hook Form + Zod validating field-for-field
against `backend/src/validators/authValidators.ts`/`placeValidators.ts`). Two
real backend bugs surfaced and fixed while building this (not new scope,
pre-existing gaps): **`SignUpResponse.data`** was typed `{email, userType}` but
the resolver always returned `{user, token}` (same shape as `LoginResponse`) —
fixed the GraphQL SDL to match, no resolver change needed; **the password
schema's `.min(8)`** was missing from both `signUpSchema` and
`signUpBusinessSchema` despite their own Joi messages claiming an 8-character
minimum — added. Auth session state: `lib/auth/AuthContext.tsx` (access token
in memory, refresh token in `localStorage`, trades a stored refresh token for a
fresh session on page load via `refreshAccessToken`) + `lib/auth/accessToken.ts`
(module-level holder the Apollo auth link reads on every request) — implements
`05-frontend-plan.md`'s "Auth on the frontend" MVP decision exactly.

### 3. Authenticated shell (sidebar + top bar) ✅ Built (2026-08-13)

**Chosen: Variant A.** Faithful `w-60` (240px) sidebar adapted from the real
source, holding only the 3 Phase-4 nav items (Discover, Categories, My Reviews) —
Saved/Notifications/Profile/Settings are **fully absent**, not locked/disabled.
Identical for REGULAR and BUSINESS users. Refinements beyond the initial port: a
desktop collapse-to-icon-only toggle (circular button in the top bar) with hover
tooltips, a mobile hamburger + slide-over drawer (the real source had zero mobile
handling), smooth label transitions, and a working "Log out" affordance in the
avatar dropdown (real source had none).

**Correction worth remembering**: the real source's sidebar is a hand-rolled
`<aside>`, *not* shadcn/ui's `Sidebar` primitive, despite what the design-tokens
research initially claimed — don't reach for that primitive expecting it to match.

GraphQL: `authMeUser` (load current user for the shell's avatar/name), `signOut`.

Ticket: [04-authenticated-shell.md](../../.scratch/phase-4-frontend-mvp/tickets/04-authenticated-shell.md).
Prototype: `prototype/authenticated-shell` (commit `59b721a`).

**Real implementation** (`frontend/src/routes/app/AppLayout.tsx`): the collapse
toggle, mobile drawer, tooltips, and dropdown ported faithfully; `Log out` calls
`AuthContext.logout()` for real (revokes the session server-side, best-effort)
and navigates to `/`. One deviation from the prototype's hardcoded avatar photo:
since no profile-picture upload flow exists yet, `profilePicture` is `null` for
essentially every real user - rather than fake a stock photo as if it were the
user's own, unset avatars render as initials-in-a-circle instead. `Discover`/
`Categories`/`My Reviews` are routed and titled correctly but still placeholder
content (`ScreenPlaceholder.tsx`) - each is its own not-yet-built screen ticket.
`PrivateRoute.tsx` gates the whole `/app` branch, redirecting to `/login`.

### 4. Discover screen ✅ Built (2026-08-13)

**Chosen: A (default) + C (via toggle), B dropped.** A is the primary layout: dark
hero-gradient search section (the real source's own gradient), collapsible top
filter panel (category/price/min-rating/open-now), sort tabs
(Highest Rated/Trending/New/Nearby), full-width card grid + Trending strip + New
Places strip (retitled from "New Nearby" - see below). A real "See in map" button
(top-right of the results header) switches to C — a map+list split view (Leaflet +
OpenStreetMap, see Decisions table) with hover tooltips on pins and a reciprocal
"Back to list" button.

Card badges are grounded in real fields only: "Verified" (`Place.isVerified`) and
"Trending" (`Place.trending_score`) — the Figma source's other two badge variants
("Top Rated," "Community Favorite") have no backend basis and were dropped.

GraphQL: `listPlaces(filter, sort, near, first, after)` — filter covers category,
price range, min rating, open now, free-text query; sort covers all four
`PlaceSortEnum` values including `NEAREST` for the map view.

Ticket: [05-discover-screen.md](../../.scratch/phase-4-frontend-mvp/tickets/05-discover-screen.md).
Prototype: `prototype/discover-screen` (commit `9c6b40a`).

**Real implementation** (`frontend/src/routes/app/discover/`): `DiscoverPage.tsx`
(state + queries) driving `DiscoverListView.tsx`/`MapView.tsx`. Several real gaps
between the prototype's mock data and the actual API, resolved while building:

- **Two real backend bugs found and fixed** (not new scope): `Place.category` was
  declared `String` in the schema but had **no field resolver at all** — always
  resolved `null`. Retyped to `Place.category: Category` (a full nested object,
  matching the `owner: User` field-resolver pattern already established) with a
  resolver added, guarding the case where `categoryId` is unset (returns `null`
  rather than 404ing the whole `listPlaces` response). `Place.trendingScore` was
  never exposed in GraphQL at all despite being a real materialized column the
  "Trending" badge depends on — added to the schema (default field resolution,
  no resolver needed).
- **Category/price filters are single-select, not the prototype's mock
  multi-select** — `PlaceFilterInput.categoryId`/`priceRange` each take exactly
  one value (`backend/src/graphql/typeDefs/placeTypedefs.ts`), not an array.
  Clicking an already-active filter pill clears it (radio-with-off), rather than
  faking multi-select the API can't express.
- **"Nearby" sort uses real browser geolocation** (`useGeolocation.ts`,
  `navigator.geolocation.getCurrentPosition`) — the prototype's fake "Brooklyn,
  NY" location pill was dropped entirely (no reverse-geocoding exists to make it
  real). Selecting "Nearby" requests location; results fall back to Highest Rated
  while pending/denied rather than erroring, and "Nearby" stays visually selected
  so it flips to real `NEAREST`-sorted results the moment permission is granted.
- **"New Nearby" strip retitled "New Places"**, driven by the real `NEW` sort only
  — the backend has no combined "new+nearby" sort, and the prototype's own mock
  data didn't actually combine them either; the new title doesn't imply
  geolocation is used there.
- **No real place photos exist yet** (no upload flow, Phase 8 Media — same gap
  Place Detail's ticket already flagged) — cards/map pins use a
  category-tinted placeholder (reusing `frontend/src/lib/categoryStyles.ts`)
  instead of the prototype's fake Unsplash stock photos.
- **"View Place" now links somewhere real**: `/app/places/:placeId`, a
  `ScreenPlaceholder`-style stub (Place Detail is its own not-yet-built ticket) —
  not a dead button.
- **Map**: `react-leaflet` + OpenStreetMap tiles, a custom `divIcon` pin (Leaflet's
  default marker images don't resolve correctly under Vite's bundling — a
  well-known gotcha, sidestepped rather than hit), centered on the average
  coordinates of the current result set, hover tooltips showing the place name
  (no photo, per the point above).
- **Cursor pagination**: a real "Load more" button using `listPlaces`'
  `pageInfo`/`fetchMore`, not attempted in the prototype (which had 8 static mock
  items and no pagination concern at all).

Verified live against the real backend: default sort, category/price/rating/
open-now/search filter combinations, `TRENDING` (including the empty-strip case
when no place has `trendingScore > 0`), and cursor pagination's `endCursor`/
`hasNextPage` — all confirmed correct with real data before wiring into the UI.

### 5. Categories screen ✅ Built (2026-08-13)

**Chosen: Variant A.** Dark gradient hero ("Explore Places by Category"), card
grid matching Figma exactly — cover photo + gradient overlay + centered icon/name
+ "N businesses · X★ avg" meta row (see New backend scope) — plus the
platform-wide stats row (Total Businesses / Categories / Reviews — see New
backend scope for the first and third; "Categories" is already real,
`categories().data.length`). Clicking a card opens a colored category-detail
sub-screen: Top Rated grid + numbered Trending list, banner subtitle also showing
the real count/rating.

GraphQL: `categories`, `category(id)` (both gaining `coverImageUrl`/
`businessCount`/`avgRating`), `platformStats` (new), `listPlaces(filter:
{categoryId}, sort: HIGHEST_RATED | TRENDING)` for the detail sub-screen's two
sections.

Ticket: [07-categories-screen.md](../../.scratch/phase-4-frontend-mvp/tickets/07-categories-screen.md).
Prototype: `prototype/categories-screen` (commits `ae4563f`, `098a76a`).

**Real implementation** (`frontend/src/routes/app/categories/`): `CategoriesPage.tsx`
(hero + `PlatformStatsRow` + `CategoryCard` grid) and `CategoryDetailPage.tsx`
(colored banner + `PlaceCard` grid for Top Rated + `RankedPlaceRow` numbered list
for Trending Now), routed as a real nested route (`/app/categories/:categoryId`,
not a client-side toggle) since it's genuinely distinct, bookmarkable content -
unlike Discover's list/map toggle, which is the same data in two view modes.
Reused `PlaceCard` from the Discover screen directly for Top Rated (same
`listPlaces` shape, no reason to duplicate it).

- **`coverImageUrl` is real but still unseeded** (`docs/03-architecture.md` has
  flagged this since it was added) — `CategoryCard`/`CategoryDetailPage` use the
  category's own accent gradient (`frontend/src/lib/categoryStyles.ts`, not a
  gray placeholder) as the card background either way; a photo would layer
  underneath the gradient automatically the moment `coverImageUrl` gets
  populated, no code change needed then.
- **`Category.icon` is a lucide-react icon name string** (seed-data managed),
  resolved via a small explicit lookup (`frontend/src/lib/categoryIcons.ts`)
  covering the 11 real seeded categories (10 from Figma + `Bar`, kept as an
  11th per `docs/03-architecture.md`) rather than a dynamic import of lucide's
  whole icon barrel - fails to a real fallback icon (not a blank render) for
  any future category whose icon name isn't yet mapped. `categoryStyles.ts`
  also gained a `Bar` entry (a real accent gradient, not the generic
  gray fallback the Discover screen's cards already fall back to for
  unmapped categories).
- **A fourth, more structural Apollo Client v4/codegen incompatibility found
  and fixed** while adding `Category($id: Int!)` (the platform's first query
  with an all-required-variables input) - documented in full in
  `frontend/README.md`'s "Known workarounds": `typescript-react-apollo`'s
  required-variables enforcement pattern (an intersected wrapper signature)
  conflicts with how Apollo Client v4 actually enforces required variables
  (via `useQuery`'s own overload set, not the `Options` type), breaking the
  generated wrapper's *internal* call regardless of the outer signature. Fixed
  by casting only that internal call - the outer signature callers actually
  see and get type-checked against is untouched, so `variables` is still
  correctly required at call sites. The post-codegen patch script was renamed
  `fix-codegen-apollo-v4.mjs` (from `fix-codegen-suspense-overloads.mjs`) to
  reflect it now fixes two unrelated gaps, not one.

Verified live against the real backend: `categories`/`category(id)` (including
the real `businessCount`/`avgRating`/`icon` per category), and both
`listPlaces(filter: {categoryId}, sort: ...)` queries the detail sub-screen
needs - all confirmed correct with real data before wiring into the UI.

### 6. Place detail + write/edit review ✅ Built (2026-08-13)

**Chosen: Variant A.** A real, complete `PlaceDetailScreen` turned up in the Figma
source mid-effort (didn't exist when this ticket was first checked). Faithful
port: full-width cover (generic placeholder — see Decisions table), two-column
body — reviews + rating-breakdown overview on the left, place info/similar-places/
owner-info sidebar on the right. Full write/edit/delete-review flow (star picker +
textarea, one review per place per person), helpful-vote toggle, and a complete
owner-reply composer (open/write/submit, nested reply display).

**Critical implementation note**: the prototype's visitor/owner toggle is a
demo-only device — see Decisions table. Production derives it from auth context.

GraphQL: `getPlaceById`, `placeReviews(placeId, first, after, sort)` (gaining a
`sort` arg — see New backend scope), `toggleHelpfulVote`, `createReview`/
`updateReview`/`deleteReview`, `createReviewReply`/`updateReviewReply`/
`deleteReviewReply`, `Place.ratingBreakdown` (new), `ReviewReply.createdAt` (new),
`listPlaces(filter: {categoryId})` for the "Similar Places Nearby" sidebar.

Ticket: [06-place-detail-review.md](../../.scratch/phase-4-frontend-mvp/tickets/06-place-detail-review.md).
Prototype: `prototype/place-detail-review` (commit `0e7746c`).

**Real implementation** (`frontend/src/routes/app/placeDetail/`): `PlaceDetailPage.tsx`
(header, hours accordion, CTA column, sidebar) + `RatingOverview.tsx` +
`WriteReviewForm.tsx` (shared for create/edit) + `ReviewCard.tsx` (helpful vote,
edit/delete, nested reply display, inline owner-reply composer).

- **Viewer/owner mode is derived, never a toggle**: `isOwner = user?.id ===
  place.owner?.id`, exactly the critical correction this ticket flagged - no
  toggle UI shipped.
- **Another real, trivial gap found and fixed**: `Review` had no `createdAt`
  field exposed in GraphQL at all (only `ReviewReply.createdAt` had been added
  in an earlier pass) - review dates couldn't be shown even though `RECENT`
  sort already worked server-side. Added, same "default field resolution off
  the model instance" pattern as everywhere else this convention applies.
- **`UserAvatar` extracted to `frontend/src/components/`** - the
  initials-fallback avatar (no photo upload flow exists) was inline in
  `AppLayout.tsx`; needed again here (reviewer avatars, owner info sidebar,
  reply attribution), so it's now a shared component. `AppLayout.tsx` updated
  to use it too, rather than carrying two copies.
- **"Manage Listing"/"Report listing"** — matches the ticket's own scope
  decisions: the former renders per the design but isn't wired to a real
  destination (Business Dashboard is Phase 6, doesn't exist yet, not even as a
  stub); the latter is omitted entirely (no moderation pipeline exists
  anywhere in this project, so not even a client-only stand-in makes sense).
- **"Similar Places Nearby"** uses `listPlaces(filter: {categoryId})`,
  filtering out the current place and capping at 3, exactly as scoped.

Verified live end-to-end against the real backend with a fresh business
account + place created for the purpose: `getPlaceById` (including
`ratingBreakdown`/`hours`/`owner`), `placeReviews` with real `createdAt`,
`createReview`/`updateReview`/`deleteReview`, `toggleHelpfulVote`, and
`createReviewReply` (as the place's real owner) - all confirmed correct with
real data before wiring into the UI.

### 7. My Reviews screen ✅ Built (2026-08-14)

**Chosen: Variant B.** Resolves this ticket's own open question (no draft concept
exists in the backend): the Published/Drafts tabs from Figma are kept, but Drafts
is explicitly client-side/this-device-only (`localStorage`, never sent to the
API), with a visible note saying so. Stats reduced to 3 client-computed cards
(Total Reviews / Helpful Votes / Businesses — "Elite" dropped), an amber
"Most Helpful Review" banner, review cards with a real inline star+textarea Edit
form and a confirm-before-Delete step.

GraphQL: `myReviews(first, after)`, `updateReview`, `deleteReview`. "Share" is a
client-only action (copy link / native share sheet) — no API involved.

Ticket: [08-my-reviews-screen.md](../../.scratch/phase-4-frontend-mvp/tickets/08-my-reviews-screen.md).
Prototype: `prototype/my-reviews-screen` (commit `b9f319b`).

**Real implementation** (`frontend/src/routes/app/myReviews/`): `MyReviewsPage.tsx`
(stats row, most-helpful banner, Published/Drafts tab state, empty states) +
`StatsRow.tsx` + `MostHelpfulBanner.tsx` + `ReviewListItem.tsx` (inline
star+textarea edit, share via `navigator.share`/clipboard fallback, delete) +
`DraftCard.tsx`.

- **No backend aggregate exists for the stats row or "most helpful"** — both are
  a plain client-side reduction over the full `myReviews(first: 50)` list (no
  `totalCount` on `PageInfo` either), matching the ticket's own scope note.
- **Drafts needed a real creation entry point** the ticket's own prototype never
  specified (its demo only showed a pre-seeded draft's display/delete, no way to
  create one) — added a "Save as Draft" button to Place Detail's
  `WriteReviewForm` (only shown when writing a new review, not editing an
  existing one), writing to the same `frontend/src/lib/drafts.ts` localStorage
  module (`saveDraft`/`updateDraft`/`deleteDraft`/`getDrafts`) that this screen's
  Drafts tab reads from — a real end-to-end flow, not a display-only dead end.
- **Share** uses `navigator.share` when available, falling back to
  `navigator.clipboard.writeText` with a 2-second "copied" checkmark state —
  client-only, no API involved, matching the ticket's scope.

Verified live end-to-end against the real backend with a fresh regular-user +
business + place created for the purpose: `createReview`, `myReviews` (confirmed
shape matches the query exactly, including `place.category.label`),
`updateReview`, `deleteReview` (confirmed the review disappears from a
follow-up `myReviews` call) — all confirmed correct with real data before
wiring into the UI. Drafts CRUD is `localStorage`-only by design, exercised via
the Place Detail "Save as Draft" entry point and this screen's Continue/Delete
actions.

## Suggested build sequencing

1. **Repo restructuring + project scaffold + design tokens** ✅ **Done**
   (2026-08-13) — `git mv` into `backend/`/`frontend/`, Vite+React+TS+
   Tailwind+shadcn/ui+React Router+Apollo Client+GraphQL Code Generator+React
   Hook Form+Zod all installed and wired, and the real extracted tokens
   (colors, radius, fonts, hero gradient, category accent colors) wired into
   `frontend/src/index.css` in place of shadcn/ui's default theme (see
   [05-frontend-plan.md](../05-frontend-plan.md#design-tokens) and
   `frontend/README.md`). Real screens can now match the Figma design's
   palette/typography exactly — next up is the first real screen.
2. **`signUpBusiness` mutation** ✅ **Done** (backend) — needed before Auth
   screens' business wizard can be wired to anything real; the screen's own
   design doesn't block on it, but demoing it end-to-end does.
3. **Auth screens + Authenticated shell** ✅ **Done** (2026-08-13) — nothing
   past login exists without these; built together since the shell is what a
   successful login lands on. `/login`, `/app` (gated by `PrivateRoute`), and
   its three nested routes all real and navigable; `Discover`/`Categories`/
   `My Reviews` still placeholder content pending their own screen tickets.
4. **Discover screen** ✅ **Done** (2026-08-13) — the default authenticated
   landing screen. Turned out not to be backend-scope-free after all: found and
   fixed two real gaps (`Place.category` had no field resolver at all,
   `Place.trendingScore` wasn't exposed in GraphQL) while building against the
   real API - see the screen section above for the full list of prototype-vs-
   real-API reconciliations (single-select filters, real geolocation for
   "Nearby," no fake photos/location pill).
5. **Place Detail** ✅ **Done** (2026-08-13) — reachable from Discover, closes
   the core "find → review" loop. `ReviewReply.createdAt`/`placeReviews`'s
   `sort` arg/`Place.ratingBreakdown` were already built in an earlier pass;
   `Review.createdAt` (a real gap only discovered while building this screen)
   got added too.
6. **Categories screen** ✅ **Done** (2026-08-13, built before Place Detail -
   this suggested order wasn't a hard dependency) — needed
   `Category.coverImageUrl`/`businessCount`/`avgRating` + the new
   `platformStats` query, both already built in an earlier pass.
7. **My Reviews screen** ✅ **Done** (2026-08-14) — no new backend scope; the
   "Drafts" tab is entirely frontend (`localStorage`), safe to build any time
   after the shell exists.
8. **Marketing landing page** — logged-out, doesn't depend on or block anything
   else; sequenced last only because it's the least critical-path for the core
   authenticated loop, not because of any technical dependency. Reasonable to
   pull earlier if a public-facing entry point matters sooner (e.g. for a demo).

## Non-goals for this phase

- Saved Places, Notifications, Profile (stats/activity chart/badges), Settings,
  Business Dashboard, Media/photo upload — all explicitly Phase 5-8, not Phase 4.
  See [04-roadmap.md](../04-roadmap.md).
- **Place attributes & amenities** (the Figma design's "Great for laptops,"
  "Dog-friendly" pills) — genuinely new scope surfaced by this phase, given its
  own [Phase 10](../04-roadmap.md#phase-10--place-attributes--amenities) rather
  than built now. Phase 4 ships illustrative placeholder pills only.
- **Business Dashboard's reputation-score/response-rate formulas** — Place
  Detail's owner-info card shows a response-rate placeholder rather than compute
  an ad-hoc version; the real formula is Phase 6's decision to make, not this
  phase's.
- Real photo uploads anywhere (place cover/logo, review photos, avatars) — Phase
  8 Media (object storage, signed URLs). Every photo slot in Phase 4 is either
  omitted or a generic placeholder, never a real per-entity image.
- Password reset / forgot-password UI — Phase 7, despite the backend already
  supporting it.
- Query-cost/depth limiting on `listPlaces` — flagged back in the Phase 3 spec's
  own open question 4, still not addressed; not newly introduced or newly
  resolved by this phase.
- Repo restructuring and project scaffolding *execution* — the decision (Vite,
  monorepo shape) is locked in [05-frontend-plan.md](../05-frontend-plan.md);
  actually running it is step 1 of Suggested build sequencing, not something
  this spec's design work did.

## Acceptance criteria (what "matches this spec" means)

Since no real `frontend/` code exists yet, these aren't live-server-verified the
way Phase 3's backend criteria were — each is "matches its captured prototype,"
which is the actual source of truth until the real build exists:

- [ ] Each of the 7 screens (marketing, auth, shell, Discover, Categories, Place
      Detail, My Reviews) matches its chosen variant's prototype, reachable at the
      throwaway branch/commit listed in that screen's section above.
- [ ] Every GraphQL operation listed per screen above is wired to real data —
      no screen ships against permanently-mocked data once its backend
      dependencies (New backend scope table) land.
- [ ] The Place Detail visitor/owner toggle does **not** exist as user-facing UI
      in the real build — viewer mode is derived from
      `currentUser.id === place.owner.id`.
- [ ] My Reviews' Drafts tab never sends draft content to the API — verify no
      network call fires until a draft is actually published as a real review.
- [ ] `npm run build` (frontend) passes with no type errors once GraphQL Code
      Generator is wired up against the (by-then-extended) live schema.
