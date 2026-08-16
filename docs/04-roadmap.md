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

## Phase 5 — Personalization — Done

Four largely independent features, built one at a time rather than planned all at
once — see [specs/phase-5-saved-places.md](./specs/phase-5-saved-places.md),
[specs/phase-5-badges.md](./specs/phase-5-badges.md),
[specs/phase-5-notifications.md](./specs/phase-5-notifications.md), and
[specs/phase-5-profile.md](./specs/phase-5-profile.md). **Notifications and
Profile were both later corrected** (2026-08-16, while working Phase 7) after
initially applying `BUSINESS`-only or wrong-source design assumptions to both
account types without checking each persona's actual Figma source — see
[specs/phase-7-profile-notifications-persona-fix.md](./specs/phase-7-profile-notifications-persona-fix.md).

- [x] `SAVED_PLACES` table + resolver + Saved screen (four tabs) — see the spec above
      for the list-type taxonomy decision (SAVED/WANT_TO_VISIT/FAVORITE, single type
      per save) and why "Reviewed" is a live-derived view over `myReviews`, never a
      stored category.
- [x] `NOTIFICATIONS` table + resolver + Notifications screen — triggering events:
      `REVIEW_REPLY`, `NEW_REVIEW`, `BADGE_EARNED` (original 3), plus
      `WATCHED_PLACE_REVIEW`/`HELPFUL_VOTE_RECEIVED` (added in the correction pass,
      previously deferred/dropped). `REGULAR` and `BUSINESS` now get different
      screens (see the correction spec) — `REGULAR`'s has the full 6 category tabs
      the Figma source always had; `BUSINESS` keeps its original 2-tab (All/Unread)
      implementation unchanged, by explicit choice rather than matching its own
      Figma's topbar-bell pattern.
- [x] Profile screen (stats, activity chart, badge grid) — see
      [specs/phase-5-profile.md](./specs/phase-5-profile.md). Read-only (cover +
      avatar, stats row reused from My Reviews, a 6-month gradient area chart
      matching the regular-user Figma source — originally the business dashboard's
      bar chart, corrected — full badge grid, recent-reviews preview), new
      `/app/profile` nav item on the reviewer shell only.
- [x] `BADGES`/`USER_BADGES` — 5 real criteria (FIRST_REVIEW/PROLIFIC_REVIEWER/
      HELPFUL_REVIEWER/EXPLORER/ELITE_REVIEWER), permanent once earned, surfaced as a
      strip on My Reviews and now the full grid on Profile — see the specs above

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

Phase 6's business-console Settings page shipped a narrower, BUSINESS-only slice of
this early — read-only profile display + a real password-change flow. Being split
into sequenced tickets like Phase 5 was, rather than planned/built all at once — see
[specs/phase-7-settings-account-edit.md](./specs/phase-7-settings-account-edit.md)
(ticket 1, and its correction note) and
[specs/phase-7-settings-security-sessions.md](./specs/phase-7-settings-security-sessions.md)
(ticket 2). **REGULAR accounts have their own Settings screen design, not a shared
one with BUSINESS** — a 6-section sidebar (Account/Preferences/Notifications/
Privacy/Security/Danger Zone) vs. BUSINESS's 2-tab screen; the two were briefly,
incorrectly merged into one shared component before being caught and split back
apart — see the correction note in ticket 1's spec.

- [x] Account fields edit — `updateUser` mutation, `fullName` only (email stays
      un-editable; no email-verification flow exists anywhere in this codebase, so
      editing the login identifier without one was deliberately deferred). Real on
      both personas' Account section/tab.
- [x] Security: active sessions list + revoke (built on the Phase 1 `SESSIONS`
      table) — `REGULAR`-only Security section for now (`BUSINESS`'s Settings screen
      has no Security tab in its own Figma source). `sessionId` threaded through
      login/signup/refresh so the UI can mark "This device" and avoid a
      silent-self-logout revoke. Danger Zone's "sign out of all other devices" is
      real too (loops the same revoke mutation); 2FA stays a labeled preview.
- [x] Preferences: dark mode — see
      [specs/phase-7-preferences-dark-mode.md](./specs/phase-7-preferences-dark-mode.md).
      A real site-wide theme (`ThemeContext`, `localStorage`-persisted, OS
      preference as the pre-choice default, no flash on load), not the mockup
      toggle it was — the full `.dark` CSS variable set already existed unused
      from the original shadcn scaffold, so this was mostly wiring, not building
      from scratch. Language/timezone stay labeled previews (real i18n/timezone
      handling is separate, unrequested scope).
- [x] Notification preference toggles (email/push — distinct from Phase 5's real
      in-app notifications) — labeled preview on the `REGULAR` Settings shell. Landed
      alongside the Security/active-sessions ticket
      ([specs/phase-7-settings-security-sessions.md](./specs/phase-7-settings-security-sessions.md),
      "build the whole shell" pass), just never checked off here — this line was a
      docs-sync catch-up (2026-08-16), not new work. Fixed one stale copy detail
      while here: the preview's caption pointed at "My Reviews' bell icon" for real
      in-app notifications, which is now its own Notifications page/nav item.
- [ ] Privacy: blocked users, data export (GDPR-style — decide scope now, it
      constrains the data model) — labeled preview on the `REGULAR` Settings shell.
      The preview UI already shipped in the Security/active-sessions ticket's
      "build the whole shell" pass (same as Notifications above) — what's still
      genuinely open is the scope decision. Asked directly (2026-08-16): blocked
      users isn't needed yet (deferred, not scoped), and the data-export mechanism
      (sync query vs. async job — the latter is blocked on Phase 8's object-storage
      decision anyway, since there's nowhere to park a generated file today) is also
      deferred entirely. Stays unchecked and undecided on purpose, not an oversight.
- [x] 2FA — labeled preview toggle on the `REGULAR` Settings shell's Security section.
      Same story as the notification toggles above: already shipped in the
      Security/active-sessions ticket's "build the whole shell" pass
      (`SecuritySection`'s `PreviewNotice` + `ToggleRow` for "Two-Factor
      Authentication") — checkbox just wasn't flipped. Docs-sync only, 2026-08-16,
      no code changed.
- [x] Delete-account flow with typed confirmation + actual data retention/anonymization
      policy — see
      [specs/phase-7-delete-account.md](./specs/phase-7-delete-account.md). Real
      typed-confirmation gate (Delete Account button disabled until the input reads
      exactly `"DELETE"`), retention policy decided and documented (reviews get
      anonymized, not removed; the `User` row gets anonymized in place via the
      existing `paranoid` soft-delete convention, not hard-deleted) — but the
      `deleteUser` mutation itself is still unbuilt, so a "successful" click shows a
      preview-notice message and does nothing. This closes out Phase 7.

## Phase 8 — Media

Deliberately last-but-not-forgotten: photos touch places, reviews, and users, so it's
cheaper to build once the shapes of those three are stable.

- [x] Pick an object storage provider (see doc 6) + the `MEDIA` table from doc 3 -
      **Cloudinary**, chosen for lowest setup friction at this project's stage. See
      [specs/phase-8-media-plumbing.md](./specs/phase-8-media-plumbing.md).
- [x] Upload flow (signed URLs, not routing file bytes through the GraphQL server) -
      Cloudinary's signed-params flavor of it (`mediaUploadSignature` query,
      direct browser→Cloudinary POST, `attachMedia` mutation to persist the result).
- [x] Wire into place photos, review photos, avatar/cover - **avatar/cover and
      place photos both done**; **review photos remain**. Avatar/cover: real
      upload, `ProfileHeader`'s camera-icon/cover-pill affordances. Place: real
      cover photo *and* a real multi-photo gallery (`PlacePhotosSection.tsx` on
      My Listing - upload, cap at 12, per-photo delete via a new `removeMedia`
      mutation), superseding the earlier direct-DB-seed placeholder.
      `mediaUploadSignature`/`attachMedia` now take `ownerType`/`ownerId` (not
      USER-implicit anymore), with real ownership checks against
      `PlaceService`. No Figma reference existed for either the avatar/cover or
      the place-gallery interaction, so both were designed reasonably rather
      than translated. Review photos remain a separate follow-up - same `MEDIA`
      table/signed-upload plumbing, `REVIEW` already in `MediaOwnerTypeEnum` but
      unimplemented in `MediaService`. See
      [specs/phase-8-media-plumbing.md](./specs/phase-8-media-plumbing.md).

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
