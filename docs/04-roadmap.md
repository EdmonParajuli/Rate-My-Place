# Roadmap

Phased so each phase ships something usable end-to-end, rather than finishing "all of
the backend" before touching a frontend. Update the checkboxes as work lands — this
doc is meant to be edited, not archived.

## Phase 0 — Done

- [x] Project scaffold, TypeScript + Express + Apollo + Sequelize + Postgres wired up
- [x] Users: signup, login, JWT issuance, `authMeUser`
- [x] Places: create/update/delete/getById, owner-gated writes
- [x] Migrations for categories, reviews, review replies (schema only)

## Phase 1 — Done

Implemented and manually verified end to end on branch
`rmp-2-phase-1-backend-hardening` — see
[specs/phase-1-backend-hardening.md](./specs/phase-1-backend-hardening.md) for the
design and [02-current-state.md](./02-current-state.md) for what shipped, including a
few previously-unknown bugs (a stray file that broke the entire Places API since the
first commit, a refresh-token collision, and a missing schema declaration) that
surfaced only once this was actually load-tested against a live server.

- [x] Fix the `authMeUser` / JWT payload field mismatch (doc 2, issue 1)
- [x] Fix `requireOwner` to check resource ownership, not just role (doc 2, issue 2)
- [x] Implement `signOut`/`forgotPassword`/`changePassword`/`confirmForgotPassword` (doc 2, issue 3)
- [x] Delete `userTypedefs.ts` (doc 2, issue 4)
- [x] Standardize the GraphQL error `extensions.status` type (doc 2, issue 6)
- [x] Add a `SESSIONS` table + wire refresh-token issuance/rotation/revocation through it

Still open, not part of this phase: doc 2's issue 7 (no tests/CI — see
[06-quality-and-ops.md](./06-quality-and-ops.md)), issue 8 (singular
`providers_category` table name), the newly-found `SignUpData` schema mismatch, and
`updatePlace`'s all-fields-required validator.

## Phase 2 — Reviews (the core loop) — Done

This is the feature the entire product is named after — prioritize it over dashboards
or notifications. Implemented and manually verified end to end across tickets 01-07
(branches `rmp-4-ticket-01-...` through `rmp-10-ticket-07-helpful-vote-toggle`,
stacked) — see [PHASE-2-REVIEWS-TICKETS.md](../PHASE-2-REVIEWS-TICKETS.md) for the
elaborated per-ticket record (design rationale, bugs found during verification,
code-review fixes). The original design spec, `specs/phase-2-reviews.md`, exists
only on branch `rmp-3-phase-2-reviews` (not yet merged to `main`), same caveat
`PHASE-2-REVIEWS-TICKETS.md` itself already notes.

- [x] `Category` model/repository/service/resolver (migration already exists) — needed as an FK target and for the Categories screen
- [x] `Review` model/repository/service/resolver: create/update/delete/getByPlace/getByReviewer, enforcing one review per (user, place)
- [x] `ReviewReply` model/repository/service/resolver: owner-only reply, one reply per review
- [x] Recompute `Place.averageRating`/`reviewCount` on review create/update/delete (service-layer, inside a transaction)
- [x] `REVIEW_VOTES` table + helpful-vote mutation/query

## Phase 3 — Discovery — Done (backend)

Makes the Discover screen real instead of a single `getPlaceById`. Implemented and
manually verified end to end across two PRs on branch
`rmp-11-ticket-01-geo-nearby-search` (PR #12: geo/`NEAREST`; PR #13: `price_range`,
`PLACE_HOURS`/`setPlaceHours`, `HIGHEST_RATED`/`TRENDING` sorts, remaining filters),
both merged to `main` — see [specs/phase-3-discovery.md](./specs/phase-3-discovery.md)
for the design, decisions, and acceptance criteria, and
[07-geo-and-location-strategy.md](./07-geo-and-location-strategy.md) /
[08-trending-strategy.md](./08-trending-strategy.md) for the geo and trending
reasoning. One item remains open, deliberately deferred: query-cost/depth limiting
on `listPlaces` (spec's Open Question 4) — this is now the first fully public,
caller-controlled, filterable list endpoint in the product, worth revisiting before
real traffic.

- [x] `listPlaces` query: filters (category, price range, min rating, open now, free-text query), sort (rating/trending/new/nearby), pagination via the existing `PageInfoInterface`/`edges` shape
- [x] `price_range` column + `PLACE_HOURS` table, "open now" computed from hours + server timezone
- [x] Basic geolocation/"nearby" — decided: lat-lng + Haversine (Tier 0, see [07-geo-and-location-strategy.md](./07-geo-and-location-strategy.md))

## Phase 4 — Frontend MVP — Done

Every screen was designed via `/wayfinder` + `/prototype` (map and 8 tickets in
`.scratch/phase-4-frontend-mvp/`, all closed 2026-08-11 → 2026-08-13) — see
[specs/phase-4-frontend-mvp.md](./specs/phase-4-frontend-mvp.md) for the full
spec: chosen variant per screen, exact GraphQL operations, and new backend scope
surfaced along the way. All items below (plus the Marketing landing page, not its
own checkbox here) built and merged 2026-08-13 → 2026-08-15 — check the spec for
what "done" means per item.

Stand up the frontend against Phases 1–3's API. See
[05-frontend-plan.md](./05-frontend-plan.md) for the stack decision.

- [x] Project scaffold + design tokens matching the Figma dark-gradient aesthetic
- [x] Auth flows: signup, login, authenticated shell (sidebar nav matching Figma)
  - [x] **New scope, surfaced 2026-08-12 while planning the Auth screens**:
        business-owner signup continues into a "create your place" step right after
        choosing the Business account type, rather than leaving new business
        accounts with no listing yet. Requires a new `signUpBusiness` mutation that
        creates the `User` and `Place` atomically in one transaction — see
        [03-architecture.md](./03-architecture.md) for the backend shape and
        [05-frontend-plan.md](./05-frontend-plan.md) for the frontend wizard
        behavior. Flagged separately rather than folded into the line above since
        it wasn't part of the original Phase 4 ticket set.
- [x] Discover screen (search, filters, sort, card grid)
  - [x] **New scope, surfaced 2026-08-12 while prototyping this screen**: a real
        map view — a "See in map" button next to the results list switches to a
        map+list split, with a "Back to list" button to return. Ships with
        **Leaflet + OpenStreetMap** (see [05-frontend-plan.md](./05-frontend-plan.md))
        — no new backend work, `listPlaces` already returns real lat/lng per place.
- [x] Place detail + write/edit a review
- [x] Categories screen
  - [x] **New scope, surfaced 2026-08-12, reverses an earlier decision on this
        same ticket**: category cards match Figma exactly — cover photo +
        "N businesses · X★ avg" — instead of shipping without them. Needs a new
        `coverImageUrl` field on `Category` plus live-computed `businessCount`/
        `avgRating` (not materialized). See
        [03-architecture.md](./03-architecture.md) for the backend shape.
- [x] My Reviews screen

## Phase 5 — Personalization

Four largely independent features, being built one at a time rather than planned all
at once — see [specs/phase-5-saved-places.md](./specs/phase-5-saved-places.md) and
[specs/phase-5-badges.md](./specs/phase-5-badges.md).

- [x] `SAVED_PLACES` table + resolver + Saved screen (four tabs) — see the spec above
      for the list-type taxonomy decision (SAVED/WANT_TO_VISIT/FAVORITE, single type
      per save) and why "Reviewed" is a live-derived view over `myReviews`, never a
      stored category.
- [ ] `NOTIFICATIONS` table + resolver + Notifications screen; decide the triggering events (new reply to your review, business responds, etc.)
- [ ] Profile screen (stats, activity chart, badge grid) — badge data now exists to
      back the grid (see below), still needs the screen itself
- [x] `BADGES`/`USER_BADGES` — 5 real criteria (FIRST_REVIEW/PROLIFIC_REVIEWER/
      HELPFUL_REVIEWER/EXPLORER/ELITE_REVIEWER), permanent once earned, surfaced as a
      strip on My Reviews ahead of the Profile screen — see the spec above

## Phase 6 — Business console — Done

Implemented and manually verified end to end (auth-gated queries/mutations exercised
directly via GraphQL, then every screen click-tested as a BUSINESS account) in two
parts:

- [specs/phase-6-business-dashboard.md](./specs/phase-6-business-dashboard.md) — the
  Dashboard home screen: the reputation-score formula, the sentiment heuristic, and the
  reconciliation against the real authenticated shell (the Figma Make output invented
  its own sidebar/branding; the real screen reuses the existing shell instead).
- [specs/phase-6-business-console.md](./specs/phase-6-business-console.md) — the five
  remaining console pages (My Listing, Reviews, Analytics, Promotions, Settings), and
  how each one was reconciled against real backend capability vs. shipped as an
  explicitly-labeled illustrative preview.

- [x] Aggregation queries: reputation score formula (weighted composite — rating,
      volume, response rate, recency; see the spec above for the resolved formula and
      weights), avg rating trend, review volume by month, response rate, sentiment
      breakdown (rating-bucket heuristic, not real NLP)
- [x] Review management UI (respond/replied states) — reuses `ReviewReply` from Phase 2
      and Phase 4 Place Detail's `ReviewCard` component directly, no new UI built
- [x] Business dashboard frontend screen (KPI cards + charts), gated to BUSINESS
      accounts as a new "Dashboard" nav item
- [x] My Listing screen — edit form + live preview, backed by the existing `updatePlace`/
      `setPlaceHours` mutations (no new backend)
- [x] Reviews screen — full review management (stats strip, sort/filter, pagination),
      reuses `placeReviews`/`createReviewReply`/`ReviewCard`
- [x] Analytics screen — date-range trend charts + rating distribution (all reuse
      existing dashboard/place data); keyword mentions and competitor benchmark ship as
      explicitly-labeled static "Pro" previews, no real backend behind them
- [x] Promotions screen — client-side-only preview (localStorage, scoped per place); no
      promotions/offers concept exists in the product yet, so this never touches the API
- [x] Settings screen (business-console-scoped) — read-only profile (no `updateUser`
      mutation exists yet) + a fully real `changePassword` flow; notification toggles
      are a static, clearly-labeled preview (`NOTIFICATIONS` is still Phase 5, unbuilt)

## Phase 7 — Settings & account lifecycle

Phase 6's business-console Settings page (see above) shipped a narrower, BUSINESS-only
slice of this early — read-only profile display + a real password-change flow. The
items below are still open: no `updateUser` mutation exists (name/email are still
un-editable for either account type), and this phase is account-type-agnostic (a
REGULAR account has no Settings screen at all yet).

- [ ] Account fields edit, preferences (dark mode, language/timezone — note dark mode
      needs to exist as a real frontend theme, not just a design mockup)
- [ ] Notification preference toggles
- [ ] Privacy: blocked users, data export (GDPR-style — decide scope now, it constrains the data model)
- [ ] Security: 2FA, active sessions list + revoke (built on the Phase 1 `SESSIONS` table)
- [ ] Delete-account flow with typed confirmation + actual data retention/anonymization policy

## Phase 8 — Media

Deliberately last-but-not-forgotten: photos touch places, reviews, and users, so it's
cheaper to build once the shapes of those three are stable.

- [ ] Pick an object storage provider (see doc 6) + the `MEDIA` table from doc 3
- [ ] Upload flow (signed URLs, not routing file bytes through the GraphQL server)
- [ ] Wire into place photos, review photos, avatar/cover

## Phase 9 — Hardening for production

Not really sequential — start doc 6's testing/CI recommendations as early as Phase 1,
don't save all of it for the end. This phase is "the remaining, harder ops work":
deployment pipeline, rate limiting/query cost limiting, observability, load testing.

## Phase 10 — Place attributes & amenities

**New phase, surfaced 2026-08-13** while designing Phase 4's Place Detail screen
(ticket `06-place-detail-review.md` — a real Figma design for this screen turned up
with amenity pills like "Great for laptops," "Dog-friendly," "Good WiFi," "Outdoor
seating"). No backend concept for this exists anywhere today — not a field on
`Place`, not mentioned in any doc before now. Rather than force it into Phase 4 (it's
a real, if small, new data model + curation question — a fixed taxonomy of
attributes? Owner-editable free tags? Curated by category?) or drop it permanently,
it gets its own phase: shown as illustrative placeholder pills in the Phase 4
prototype (not wired to any real field), built for real here once the shape of the
`Place` entity has settled further.

- [ ] Decide the attribute model: fixed taxonomy (enum-like, curated) vs. free-form
      owner-entered tags vs. category-scoped presets
- [ ] Data model: likely a join table (`PLACE_ATTRIBUTES` or similar), not a column on
      `Place` directly, since a place can have several
- [ ] Owner-editable via the "Manage Listing" flow the Place Detail screen already
      points at (see ticket 06)
- [ ] Wire into the Place Detail screen's amenity pills, replacing the Phase 4
      placeholder content

## Open questions worth resolving before/around Phase 3-4

These are yours to decide, not technical inevitabilities — flagging so they don't get
decided by accident:

1. **Repo shape**: keep frontend in this same repo (e.g. `/web` alongside the current
   root-level backend) or a separate repo? Monorepo is easier for a solo dev sharing
   types between GraphQL schema and frontend codegen; separate repos are cleaner if
   you ever want independent deploy cadences or a different team boundary.
2. **Geo/"nearby"**: real geospatial queries (PostGIS) vs. a simpler bounding-box/city
   field for the MVP. The Figma design shows a city picker ("Brooklyn, NY"), which
   suggests city-level filtering may be enough for launch.
3. ~~**Reputation score formula**: what actually goes into it (rating, volume,
   recency, response rate)?~~ **Resolved in Phase 6** — weighted composite of all
   four, see [specs/phase-6-business-dashboard.md](./specs/phase-6-business-dashboard.md).
4. **Data export & delete-account scope**: full GDPR-style compliance, or a lighter
   "reasonable effort" version for an MVP? Affects the data model (need to track what
   must be exportable) and how soft-delete/anonymization interact.
