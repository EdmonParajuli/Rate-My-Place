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

## New backend scope surfaced during this phase (not yet built)

Every one of these was discovered while designing a Phase 4 screen against the real
Figma design, reconciled against what the backend actually exposes today. None are
built — full shape for each is in [03-architecture.md](../03-architecture.md)'s
"Planned: ..." sections, linked below.

| Addition | Needed for | Detail |
|---|---|---|
| `signUpBusiness` mutation (atomic `User` + `Place` creation, one transaction) | Auth screens' business-signup wizard | [03-architecture.md § signUpBusiness](../03-architecture.md#planned-signupbusiness-atomic-account--place-creation) |
| `Category.coverImageUrl: String` (seed-managed, no new mutation) | Categories screen's cards matching Figma | [03-architecture.md § Category cover image](../03-architecture.md#planned-category-cover-image--live-business-countavg-rating) |
| `Category.businessCount: Int` / `avgRating: Float` (live-computed, not materialized) | Categories screen's cards + category-detail banner | same section as above |
| `platformStats` query (`totalPlaces`/`totalReviews`, live `COUNT`s) | Categories screen's platform-wide stats row | [03-architecture.md § platform-wide stats](../03-architecture.md#also-needed-platform-wide-stats-totalplacestotalreviews) |
| `ReviewReply.createdAt: DateTime` | Place Detail's reply timestamps | [03-architecture.md § Place Detail follow-ups](../03-architecture.md#planned-place-detail-follow-ups-reviewreplycreatedat-review-sort-rating-breakdown) |
| `placeReviews(..., sort: ReviewSortEnum)` (`RECENT`/`HELPFUL`) | Place Detail's review sort tabs | same section as above |
| `Place.ratingBreakdown: [RatingBreakdownEntry]` (live-computed, `GROUP BY rating`) | Place Detail's rating-overview bar chart | same section as above |

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

### 2. Auth screens (signup / login)

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

### 3. Authenticated shell (sidebar + top bar)

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

### 4. Discover screen

**Chosen: A (default) + C (via toggle), B dropped.** A is the primary layout: dark
hero-gradient search section (the real source's own gradient), collapsible top
filter panel (category/price/min-rating/open-now), sort tabs
(Highest Rated/Trending/New/Nearby), full-width card grid + Trending strip + New
Nearby strip. A real "See in map" button (top-right of the results header)
switches to C — a map+list split view (Leaflet + OpenStreetMap, see Decisions
table) with hover tooltips on pins and a reciprocal "Back to list" button.

Card badges are grounded in real fields only: "Verified" (`Place.isVerified`) and
"Trending" (`Place.trending_score`) — the Figma source's other two badge variants
("Top Rated," "Community Favorite") have no backend basis and were dropped.

GraphQL: `listPlaces(filter, sort, near, first, after)` — filter covers category,
price range, min rating, open now, free-text query; sort covers all four
`PlaceSortEnum` values including `NEAREST` for the map view.

Ticket: [05-discover-screen.md](../../.scratch/phase-4-frontend-mvp/tickets/05-discover-screen.md).
Prototype: `prototype/discover-screen` (commit `9c6b40a`).

### 5. Categories screen

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

### 6. Place detail + write/edit review

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

### 7. My Reviews screen

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

## Suggested build sequencing

1. **Repo restructuring + project scaffold + design tokens** — `git mv` into
   `backend/`/`frontend/` (per [05-frontend-plan.md](../05-frontend-plan.md)),
   Vite + Tailwind config from screen 0's extracted tokens. Everything else
   depends on this existing.
2. **`signUpBusiness` mutation** (backend) — needed before Auth screens' business
   wizard can be wired to anything real; the screen's own design doesn't block on
   it, but demoing it end-to-end does.
3. **Auth screens + Authenticated shell** — nothing past login exists without
   these; build together since the shell is what a successful login lands on.
4. **Discover screen** — the default authenticated landing screen, no new backend
   scope needed (Leaflet integration is frontend-only work).
5. **Place Detail** — reachable from Discover, closes the core "find → review"
   loop. Needs `ReviewReply.createdAt` + `placeReviews`'s new `sort` arg +
   `Place.ratingBreakdown` (backend, independent small additions — can land
   before or in parallel with the screen's own frontend work).
6. **Categories screen** — needs `Category.coverImageUrl`/`businessCount`/
   `avgRating` + the new `platformStats` query (backend) before its cards show
   real data; the screen's own frontend work can start against mock data in the
   meantime, same as every other screen already did during prototyping.
7. **My Reviews screen** — no new backend scope; the "Drafts" tab is entirely
   frontend (`localStorage`), safe to build any time after the shell exists.
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
