# Current State Audit

Honest snapshot as of 2026-08-15. Nothing here is a criticism of pace — this is a
young project and the foundation (layering, validation, soft deletes, generic
repository) is genuinely solid. This doc exists so the next session doesn't have to
re-derive it by reading every file again.

This was last rewritten wholesale right after Phase 1 (2026-07-29), when the project
was backend-only with just Users and Places as full vertical slices. Phases 2–6 have
since landed a full review/reply/vote system, sessions, categories, platform stats, a
business-dashboard aggregation layer, and — as of Phase 4 — an entire `frontend/`
that didn't exist at all when this doc was first written. Rewritten wholesale again
here rather than patched, since almost every line of the old "What's built" section
was stale.

## What's built

**Stack:** `backend/` — Node.js + TypeScript, Express, Apollo Server (via
`@apollo/subgraph`'s `buildSubgraphSchema` — see note below), Sequelize + PostgreSQL,
Joi validation, JWT auth, bcrypt hashing. `frontend/` — Vite + React + TypeScript,
Tailwind + shadcn/ui, Apollo Client (codegen'd hooks from the live schema), React
Router v7, Recharts (dashboard charts), Leaflet + OpenStreetMap (Discover's map view).
Two independent `package.json`s, no npm workspaces — see the repo root
`CLAUDE.md`/[05-frontend-plan.md](./05-frontend-plan.md) for the shape.

**Layering** (see [03-architecture.md](./03-architecture.md) for the full picture):
`typeDefs → resolvers → services → repositories (generic BaseRepository<IT,RT>) → Sequelize models`
on the backend; `GraphQL client → Apollo Server → resolvers` on the frontend, no
separate state-management layer — Apollo's cache is the client state. Consistent
across every feature.

**Backend entities with a full vertical slice (model → repository → service →
resolver → typeDefs):**
- **Users** — signup, login, `authMeUser` (now including `createdAt`, added for the
  Profile screen's "member since"), password hashing, JWT issuance,
  `changePassword`/`forgotPassword`/`confirmForgotPassword`, `updateUser`
  (`fullName` only — email is still permanently fixed once an account is created;
  no email-verification flow exists anywhere in this codebase, so editing the login
  identifier without one was deliberately deferred, see
  [specs/phase-7-settings-account-edit.md](./specs/phase-7-settings-account-edit.md)).
- **Places** — create/update/delete/getById/listPlaces (cursor-paginated, sort by
  NEW/NEAREST/HIGHEST_RATED/TRENDING, filter by category/price/rating/open-now),
  owner-gated writes, lat/lng + Haversine `NEAREST` sort, `trendingScore` refreshed
  hourly by a background job (`src/jobs/trendingScoreJob.ts`,
  [08-trending-strategy.md](./08-trending-strategy.md)), business hours
  (`PlaceHourService`, `setPlaceHours`, live `openNow`).
- **Categories** — read-only browsing (`categories`, `category(id)`), `coverImageUrl`
  + live-computed `businessCount`/`avgRating` (not materialized). No mutations —
  migration/seed-managed, as designed.
- **Reviews** — create/update/delete, one review per `(place, reviewer)` (service
  check + DB unique index), self-review blocked, cursor-paginated `placeReviews`/
  `myReviews` (sort by RECENT/HELPFUL), `ratingBreakdown` (zero-filled 5..1 star
  counts), `Place.averageRating`/`reviewCount` recomputed from source on every
  write. `createReview` also notifies every user watching the place (saved it or
  reviewed it before, minus the new reviewer and the owner) via
  `WATCHED_PLACE_REVIEW`.
- **Review replies** — create/update/delete, one reply per review (DB unique index),
  owner-gated.
- **Review helpful votes** — `toggleHelpfulVote`, `helpfulCount`/`helpfulByMe` on
  `Review`. Notifies the review's author via `HELPFUL_VOTE_RECEIVED` on a new vote
  (not on un-vote, never for a self-vote) — no dedup, a known spam-vector limitation
  carried forward from when this event was originally deferred
  ([specs/phase-5-notifications.md](./specs/phase-5-notifications.md)).
- **Sessions** — refresh tokens hashed and persisted at issuance (`providers_sessions`),
  rotated on every renewal, revocable (`signOut`, `revokeSession`, automatically on
  password change), `activeSessions` query lists them. `LoginToken.sessionId` (Phase
  7) lets the frontend identify its own live session for the Security settings UI.
- **Platform stats** — orchestration-only `PlatformStatsService` (no repository of its
  own), composes Place/Review/User counts for the marketing landing page's stats strip.
- **Business dashboard** — orchestration-only `BusinessDashboardService`: reputation
  score (weighted composite), monthly rating/volume trends, sentiment breakdown
  (rating-bucket heuristic), response rate, all live-computed from
  `providers_reviews`/`providers_reviews_replies` — see
  [specs/phase-6-business-dashboard.md](./specs/phase-6-business-dashboard.md).
- **Media** (Phase 8, complete) — Cloudinary-backed signed uploads
  (`mediaUploadSignature`/`attachMedia`, both taking `ownerType`/`ownerId`),
  `providers_media` is a polymorphic audit table (doc 3's `PLACE | REVIEW | USER`
  × `PHOTO | AVATAR | COVER` shape). All three owner types have real upload flows
  now, each gated by real ownership checks (`assertOwnership` against
  `PlaceService`/`ReviewService` for places/reviews). `User.profilePicture`/
  `coverPicture` and `Place.coverPhotoUrl` are denormalized read-cache columns
  (same "recompute and store" precedent as `Place.averageRating`) — reading them
  anywhere embedded (review/place owner cards, Discover cards) is a plain column
  read, never a `MEDIA` lookup. `Place.photos` is a live list resolver — safe
  because it's only ever requested for one place at a time. `Review.photos` is
  also live, but reviews are genuinely listed in bulk (`placeReviews`/
  `myReviews`), so it's only reachable through a single-review `getReviewById`
  query, never embedded in those list queries — `Review.photoCount` (a
  materialized column, same pattern as `helpfulCount`) is what the lists
  actually select. A `removeMedia` mutation deletes an individual media row
  (ownership-checked, clears/resyncs the matching denormalized
  column/count). See
  [specs/phase-8-media-plumbing.md](./specs/phase-8-media-plumbing.md).

**Frontend screens, all against the real API above (no mocked data anywhere in
`frontend/`):**
- **Marketing** — landing page (dark hero, dual reviewer/business path chooser,
  trending-places strip backed by real `TRENDING` sort, testimonials).
- **Auth** — login, signup (regular + a business wizard that creates the `User` and
  `Place` atomically via `signUpBusiness`), session persistence across reloads (a
  stored refresh token silently re-authenticates on mount).
- **Discover** — search/filter/sort, card grid + a real Leaflet/OpenStreetMap view
  toggle. Cards show a real `coverPhotoUrl` when a place has one (real upload now
  lives on My Listing, see the Media bullet above), falling back to the existing
  category-tinted gradient placeholder.
- **Categories** — browse grid (real cover images/stats) + category-detail sub-screen.
- **Place Detail** — full write/edit/reply review flow, helpful votes, rating
  breakdown, business hours. Hero renders `coverPhotoUrl` when set, falling back to
  the dashed "Cover photo" placeholder. Review cards can attach real photos too —
  only while editing an existing review (a not-yet-created review has no id to
  attach to), capped at 6, via `ReviewPhotosSection.tsx`; every review with
  photos shows a click-to-expand `ReviewPhotoStrip.tsx` (shared with My Reviews).
- **My Reviews** — Published/Drafts tabs (drafts are a deliberate client-side-only,
  `localStorage` feature — no backend draft concept exists), real edit/delete, a
  compact 5-badge earned/locked strip (`BadgeStrip.tsx`). Its own inline-edit UI
  (`ReviewListItem.tsx`) stays text/rating-only — photo upload only lives on
  Place Detail's review composer (see above) — but photos already attached are
  visible here too via the same shared `ReviewPhotoStrip.tsx`.
- **Saved** — four tabs (All Saved/Want to Visit/Reviewed/Favorites), save/heart
  toggle from Place Detail and Discover cards.
- **Notifications** — `REGULAR` and `BUSINESS` get different screens at the same
  `/app/notifications` route/nav item (a thin `NotificationsPage.tsx` picks by
  persona), same split as Settings.
  `RegularNotificationsPage.tsx`: 6 real category tabs (All/Reviews/Likes/Replies/
  Recommendations/System — Recommendations stays genuinely empty, a real future
  feature, not a preview), avatar-first rows (`Notification.place.label` backs the
  initials, no per-notification actor photo/name exists anywhere in this schema).
  `BusinessNotificationsPage.tsx`: the original 2-tab All/Unread screen, unchanged.
  Nav pill (`unreadNotificationCount`) still polls every 30s on both shells. 5
  triggering event types total now: `REVIEW_REPLY`/`NEW_REVIEW`/`BADGE_EARNED`
  (Phase 5) plus `WATCHED_PLACE_REVIEW`/`HELPFUL_VOTE_RECEIVED` (added here,
  see [specs/phase-7-profile-notifications-persona-fix.md](./specs/phase-7-profile-notifications-persona-fix.md)).
- **Profile** (`REGULAR` accounts only, new `/app/profile` nav item) — cover +
  avatar + "member since", stats row and a 6-month activity area chart
  (`ProfileActivityChart.tsx`) both computed client-side from `myReviews` (no new
  backend aggregate, same "start simple" precedent as My Reviews' `StatsRow`), full
  badge grid (`myBadges`, earned vs.
  locked with descriptions), recent-reviews preview. Account field editing (name,
  password) still lives on Settings, not duplicated here — but avatar/cover photo
  upload is real and lives here (Phase 8's Cloudinary-backed `MEDIA` plumbing, see
  [specs/phase-8-media-plumbing.md](./specs/phase-8-media-plumbing.md)), a camera-
  icon overlay on the avatar and a "Change cover" pill on the banner. See also
  [specs/phase-5-profile.md](./specs/phase-5-profile.md).
- **Settings** — `REGULAR` and `BUSINESS` each get their own screen at the same
  `/app/settings` route/nav item (a thin `SettingsPage.tsx` picks by persona), not
  one shared screen — the two have genuinely different designs in their own Figma
  sources. `RegularSettingsPage.tsx`: 6-section sidebar (Account, Preferences,
  Notifications, Privacy, Security, Danger Zone) — Account (editable Full Name via
  `updateUser`, real password change, email read-only), Security's active-sessions
  list + revoke (+ Danger Zone's "sign out of all other devices"), and Danger Zone's
  Delete Account typed-confirmation gate (button disabled until the input reads
  exactly `"DELETE"`) are real; the deletion itself is still a preview no-op (no
  `deleteUser` mutation exists — see
  [specs/phase-7-delete-account.md](./specs/phase-7-delete-account.md) for the
  decided-but-unbuilt retention/anonymization policy). Preferences' Dark Mode toggle
  exists (`ThemeContext`, see below) but is currently hidden/disabled — too many
  visual bugs across unaudited screens to ship, mechanism kept intact behind a
  feature flag. Everything else on this screen is a labeled preview.
  `BusinessSettingsPage.tsx`: the original Phase 6 2-tab screen
  (Account/Notifications), unchanged. See
  [specs/phase-7-settings-account-edit.md](./specs/phase-7-settings-account-edit.md)
  (includes a correction note — these two were briefly, incorrectly merged into one
  shared component before being split back apart),
  [specs/phase-7-settings-security-sessions.md](./specs/phase-7-settings-security-sessions.md),
  and [specs/phase-7-delete-account.md](./specs/phase-7-delete-account.md).
- **Business console** (`BUSINESS` accounts get their own nav, not the reviewer
  nav — see [specs/phase-6-business-dashboard.md](./specs/phase-6-business-dashboard.md)) —
  Dashboard (KPI cards, trend charts, sentiment, review management), My Listing (edit
  form + live preview, plus a real photos section — cover photo and a capped
  12-photo gallery, both real uploads via Phase 8's Media plumbing, see
  [specs/phase-8-media-plumbing.md](./specs/phase-8-media-plumbing.md)), Reviews
  (full review management), Analytics (trend charts +
  rating distribution, real; keyword mentions/competitor benchmark, explicitly-labeled
  static previews), Promotions (`localStorage`-only preview — no promotions concept
  exists in the product at all), Settings (see the Settings bullet above — real
  password change + editable name, notification toggles are a static preview). Full
  breakdown of what's real vs. illustrative per page:
  [specs/phase-6-business-console.md](./specs/phase-6-business-console.md).

**Cross-cutting infrastructure already in place and worth keeping:**
- Centralized Joi schema primitives ([schemas.ts](../backend/src/validators/schemas.ts))
  reused across validators — keep building on this instead of inlining `Joi.string()`.
- `SuccessResponse` envelope ([responseHelper.ts](../backend/src/helpers/responseHelper.ts))
  standardizes `{message, data, edges, pageInfo, count}` — cursor pagination
  (`CursorBasedPagination`, `src/packages/cursors/`) is real and used by
  `listPlaces`/`placeReviews`/`myReviews`.
- `BaseRepository<IT, RT>` ([baseRepository.ts](../backend/src/repositories/baseRepository.ts)) —
  a real generic data-access layer. New entities should extend this, not hand-roll
  queries.
- Soft deletes (`paranoid: true`) + `underscored: true` + explicit `field:` mappings
  on every model — consistent convention, keep it.
- Config module ([config/index.ts](../backend/src/config/index.ts)) fails fast on
  missing env vars via `mustExist` — extend it rather than reading `process.env` ad
  hoc elsewhere.
- `requireAuth`/`requireOwner` (role check)/`assertOwnership` (resource check)
  primitives ([auth.ts](../backend/src/utils/auth.ts)) — ownership checks live in the
  service layer, next to the fetch that proves the resource exists, per issue 2 below.
- Frontend: GraphQL codegen against the live local schema
  (`npm run codegen` → `src/lib/graphql/generated/graphql.ts`), `AuthContext` with a
  `useRef`-guarded mount effect (React StrictMode double-invokes effects in dev — the
  guard makes the refresh-token exchange run exactly once per real mount, fixed
  2026-08-15 after it caused intermittent logout on hard reload), a `refreshUser()`
  escape hatch (re-fetches `authMeUser` and replaces context `user` — added for
  `updateUser` so the sidebar/topbar name updates immediately after an edit instead
  of on next reload), `PrivateRoute` gating the authenticated shell, `ThemeContext`
  (`lib/theme/`) for dark mode — `localStorage`-persisted, a pre-mount inline script
  in `index.html` avoids a flash of the wrong theme on load — currently **disabled**
  behind a `DARK_MODE_ENABLED` flag in both `ThemeContext.tsx` and the `index.html`
  script (too many visual bugs across unaudited screens: 44 files still use
  hardcoded literal colors instead of theme-aware tokens) — see
  [specs/phase-7-preferences-dark-mode.md](./specs/phase-7-preferences-dark-mode.md).

## Known issues / tech debt

Issues 1–6 below were Phase 1's punch list and are now **fixed** on branch
`rmp-2-phase-1-backend-hardening` (see
[specs/phase-1-backend-hardening.md](./specs/phase-1-backend-hardening.md) for the
design and this repo's git history for the actual commits). Kept here, marked done,
so this doc stays an honest record of what was true and when it changed — not deleted
outright, since "issue 1 doesn't exist anymore" is itself useful history.

1. ~~`authMeUser` is very likely broken~~ **Fixed.** Standardized on `id` across the
   JWT payload, `ContextInterface.user` (now a dedicated `AuthTokenPayload` type
   instead of the misleading full `UserInterface`), and every call site.
2. ~~`requireOwner` checks role, not resource ownership~~ **Fixed.**
   `PlaceService.updatePlace`/`delete` now take the requesting user's id and reject
   with `FORBIDDEN`/403 when it doesn't match the place's `ownerId`.
3. ~~Schema/resolver drift in auth (`signOut`/`forgotPassword`/`changePassword`/
   `confirmForgotPassword` declared but unimplemented)~~ **Fixed.** All four are
   implemented end to end, including a new sessions system they depend on (see
   the spec's §6).
4. ~~`userTypedefs.ts` is dead and self-inconsistent~~ **Fixed.** File deleted.
5. ~~No refresh-token persistence or revocation~~ **Fixed.** New `providers_sessions`
   table + `SessionService`: refresh tokens are hashed and persisted at
   issuance, rotated on renewal (`refreshAccessToken`), and revocable
   (`signOut`, `revokeSession`, or automatically on password change/reset). A new
   `activeSessions` query lists them.
6. ~~Inconsistent GraphQL error `status` typing~~ **Fixed.** A `throwError(message,
   code, status)` helper in `src/helpers/errorHelper.ts` is now the only way any
   resolver throws, `status` is always a number, and resolver `catch` blocks no
   longer swallow and rewrap `GraphQLError`s thrown by the service layer (they used
   to — which would have silently turned the new 403/404s above back into a generic
   400).

**Discovered while manually verifying Phase 1 against a live server — also fixed on
the same branch, not called out in the original spec because they weren't known yet:**

- **A stray `src/models/index.js`** (leftover `sequelize-cli init` boilerplate from
  the very first commit) shadowed the real `src/models/index.ts` at Node's module
  resolution level. Every repository's `Model.X` was `undefined` at request time —
  **signUp, login, and the entire Places API have been non-functional end-to-end since
  the first commit**, despite the server booting and connecting to the DB
  successfully (the DB connection doesn't go through this file, only the repositories
  do). This is exactly the kind of bug that only manual, live testing catches — the
  code compiles fine and looks correct on paper. Deleted the stray file.
- **Refresh tokens collided within the same second.** `jwt.sign` is deterministic
  given identical payload+secret+timing; two tokens issued for the same user inside
  the same second (e.g. signup immediately followed by login) were byte-identical,
  colliding with the new sessions table's unique hash constraint. Fixed by adding a
  random `jti` claim to refresh tokens.
- **`updatePlace`/`deletePlace` had resolvers but no schema declaration.** Both were
  fully implemented in `placeResolver.ts` (Phase 0) but never added to
  `placeTypedefs.ts`, so neither was actually callable via GraphQL. Added.

**Since fixed, found here for continuity:**

- ~~`SignUpData` doesn't match what `signUp` actually returns~~ **Fixed.**
  `signUp`/`signUpBusiness`/`login` all reuse the same `UserData`/`SignUpBusinessData`
  shape (`{user, token}`) the resolvers actually return — an SDL-only fix, no resolver
  change needed.
- ~~The unique index on `providers_reviews(place_id, reviewer_id)` isn't filtered to
  non-deleted rows~~ **Fixed.** Found 2026-08-15 while browser-testing Phase 5's
  Saved → Reviewed tab (delete-then-recreate a review on the same place tripped a
  generic Sequelize "Validation error" — not a Joi message, easy to mistake for
  something else). Same bug class `providers_reviews_replies` already had a
  partial-index fix for; this table never got the same treatment. Fixed the same way
  (`20260815170000-make-reviews-unique-index-partial.js`: drop the plain unique
  index, re-add it with `where: {deleted_at: null}`) — confirmed live that a
  deleted-then-recreated review now succeeds, and that the still-active
  one-review-per-place-per-reviewer 409 CONFLICT check is untouched.

**Still open:**

- **`updatePlace`'s validator requires every field**, so it doesn't actually support
  partial updates (it reuses `createPlaceSchema` verbatim, including `label`/
  `address`/`phone`/`categoryId` all `.required()`). Confirmed still true 2026-08-15
  while building Phase 6's My Listing page — the edit form works around this by
  always submitting every field, but a dedicated `updatePlaceSchema` allowing partial
  input is still worth doing whenever someone next touches this resolver.
- **`createPlaceSchema`'s `address` field caps at 25 characters** (`min(10).max(25)`)
  — unrealistically short for most real street addresses. Pre-existing (not
  introduced by any recent work), newly noticed 2026-08-15 while building My Listing's
  edit form; worth a follow-up since it'll trip real users, not just test data.
- **`updateUser` only covers `fullName` — email can never be changed.** Fixed as of
  Phase 7's first ticket for name; email stays permanently fixed once the account is
  created, by either account type, since no email-verification flow exists anywhere
  in this codebase and email is the login identifier. See
  [specs/phase-7-settings-account-edit.md](./specs/phase-7-settings-account-edit.md).
- ~~No tests, no CI~~ **Partially fixed (Phase 9, 2026-08-16/17).** 43 Jest
  service-layer unit tests (`backend/tests/`, mocked repositories —
  `businessDashboardMath`, `utils/auth`, `authService`, `reviewService`) plus 7 Jest
  repository/integration tests (`backend/tests/integration/`, against a real
  Postgres) covering `BaseRepository` CRUD/soft-delete/transaction-visibility and
  `ReviewRepository`'s DB-level unique constraint/soft-delete-recreate/rating stats.
  `.github/workflows/ci.yml` now runs three jobs: `backend` (`npm run build`+`npm
  test`), `backend-integration` (`npm run test:integration` against a Postgres
  service container), `frontend` (`npm run build`) — on every push to `main` and
  every PR. See [specs/phase-9-testing-ci.md](./specs/phase-9-testing-ci.md) and
  [specs/phase-9-integration-tests.md](./specs/phase-9-integration-tests.md). The
  integration-test work also found and fixed two real bugs: a migration-ordering bug
  (`create-places-table`'s FK referenced `providers_category` before that migration
  ran) invisible until migrations replayed from an empty DB, and a silent no-op in
  Sequelize's own `truncate()` that let stale data leak across test runs. Still open:
  doc 6's testing layer 3 (resolver/GraphQL tests) and frontend tests. Verification
  for everything not yet covered by the new suites is still manual, same as before:
  `npm run build` for type errors, then exercising backend changes against a live
  `npm run start:dev` server via GraphQL introspection. Per explicit user direction,
  frontend/UI changes are verified by typecheck alone — this repo's workflow does not
  require driving a browser to click-test (see the root `CLAUDE.md`).
- **Structured logging (Phase 9, 2026-08-16).** Bare `console.log`/`console.error`
  replaced with `pino` — a per-request child logger (`pino-http`, generates/echoes
  an `x-request-id`) is available as `context.logger` in every resolver, and an
  Apollo plugin logs every GraphQL operation's start/completion/errors tagged with
  that id, without needing changes in each of the 14 resolver files. See
  [specs/phase-9-structured-logging.md](./specs/phase-9-structured-logging.md).
  Still open: Sentry/error tracking (gated on a real deployed environment existing).
- **`providers_category` is still a singular table name**, inconsistent with every
  other table (`providers_reviews`, `providers_reviews_replies`, `providers_sessions`,
  etc.). Cosmetic, low priority, would need a migration to rename.

None of this blocks moving forward — it's a punch list to burn down alongside the
next couple of features, not a prerequisite for starting them.
