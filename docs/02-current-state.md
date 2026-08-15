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
- **Users** — signup, login, `authMeUser`, password hashing, JWT issuance,
  `changePassword`/`forgotPassword`/`confirmForgotPassword`. Still no
  `updateUser`/`updateProfile` mutation — name/email are permanently fixed once an
  account is created (confirmed while building Phase 6's Settings page, which shows
  them read-only for exactly this reason).
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
  counts), `Place.averageRating`/`reviewCount` recomputed from source on every write.
- **Review replies** — create/update/delete, one reply per review (DB unique index),
  owner-gated.
- **Review helpful votes** — `toggleHelpfulVote`, `helpfulCount`/`helpfulByMe` on
  `Review`.
- **Sessions** — refresh tokens hashed and persisted at issuance (`providers_sessions`),
  rotated on every renewal, revocable (`signOut`, `revokeSession`, automatically on
  password change), `activeSessions` query lists them.
- **Platform stats** — orchestration-only `PlatformStatsService` (no repository of its
  own), composes Place/Review/User counts for the marketing landing page's stats strip.
- **Business dashboard** — orchestration-only `BusinessDashboardService`: reputation
  score (weighted composite), monthly rating/volume trends, sentiment breakdown
  (rating-bucket heuristic), response rate, all live-computed from
  `providers_reviews`/`providers_reviews_replies` — see
  [specs/phase-6-business-dashboard.md](./specs/phase-6-business-dashboard.md).

**Frontend screens, all against the real API above (no mocked data anywhere in
`frontend/`):**
- **Marketing** — landing page (dark hero, dual reviewer/business path chooser,
  trending-places strip backed by real `TRENDING` sort, testimonials).
- **Auth** — login, signup (regular + a business wizard that creates the `User` and
  `Place` atomically via `signUpBusiness`), session persistence across reloads (a
  stored refresh token silently re-authenticates on mount).
- **Discover** — search/filter/sort, card grid + a real Leaflet/OpenStreetMap view
  toggle.
- **Categories** — browse grid (real cover images/stats) + category-detail sub-screen.
- **Place Detail** — full write/edit/reply review flow, helpful votes, rating
  breakdown, business hours.
- **My Reviews** — Published/Drafts tabs (drafts are a deliberate client-side-only,
  `localStorage` feature — no backend draft concept exists), real edit/delete.
- **Business console** (`BUSINESS` accounts get their own nav, not the reviewer
  nav — see [specs/phase-6-business-dashboard.md](./specs/phase-6-business-dashboard.md)) —
  Dashboard (KPI cards, trend charts, sentiment, review management), My Listing (edit
  form + live preview), Reviews (full review management), Analytics (trend charts +
  rating distribution, real; keyword mentions/competitor benchmark, explicitly-labeled
  static previews), Promotions (`localStorage`-only preview — no promotions concept
  exists in the product at all), Settings (real password change; read-only profile
  since no update mutation exists; notification toggles are a static preview). Full
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
  2026-08-15 after it caused intermittent logout on hard reload), `PrivateRoute` gating
  the authenticated shell.

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
- **No `updateUser`/`updateProfile` mutation exists.** A user's name/email can never
  be changed once the account is created, by either account type. Phase 6's Settings
  page shows this as a read-only profile rather than a form that would silently no-op
  on save; a real fix is Phase 7 scope (account-type-agnostic, not business-console
  specific).
- **No tests, no CI.** Verification across every phase so far has been manual:
  `npm run build` for type errors, then exercising the change against a live
  `npm run start:dev` server via GraphQL introspection (backend) or a
  claude-in-chrome click-through (frontend). This is the established, working method
  for this project, not a gap silently being routed around — but it's still worth
  naming as debt.
- **`providers_category` is still a singular table name**, inconsistent with every
  other table (`providers_reviews`, `providers_reviews_replies`, `providers_sessions`,
  etc.). Cosmetic, low priority, would need a migration to rename.

None of this blocks moving forward — it's a punch list to burn down alongside the
next couple of features, not a prerequisite for starting them.
