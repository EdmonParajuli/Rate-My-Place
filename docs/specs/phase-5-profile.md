# Phase 5 Spec: Profile

**Status: ✅ Built.** Fourth and last ticket of Phase 5 — Personalization, after
Saved Places, Badges, and Notifications. See
[03-architecture.md](../03-architecture.md)'s "Built: Profile" section for the
condensed version.

## Context

Per `04-roadmap.md`: **"Profile screen (stats, activity chart, badge grid) — badge
data now exists to back the grid, still needs the screen itself."**
[specs/phase-5-badges.md](./phase-5-badges.md) deliberately shipped its frontend
surface as a compact strip on My Reviews rather than block on Profile, and explicitly
left "the full Profile-screen badge grid (earned vs. locked with descriptions,
activity chart context)" as this ticket's job. Per
[01-vision-and-scope.md](../01-vision-and-scope.md) item 6, the Figma source
describes Profile as "cover + avatar, stats row, activity chart, achievement/badge
grid (earned vs. locked), recent reviews preview."

## Decisions

**Read-only — no edit flow.** Same reason Phase 6's Settings "Account" tab is
read-only: no `updateUser`/`updateProfile` mutation exists anywhere in the schema
(`docs/02-current-state.md`), so there's nothing on this screen a form could
meaningfully submit. This isn't a scope cut unique to Profile; it's the same fixed
constraint every other screen touching `User` fields has already hit.

**Every number on the screen is computed client-side from data that already
exists — no new backend aggregate.** This continues the precedent
`myReviews/StatsRow.tsx` set for My Reviews: the stats row (total reviews, helpful
votes, businesses reviewed) and the activity chart are both derived in the browser
from the same `myReviews` query already used elsewhere, not a new reviewer-side
dashboard endpoint. The only backend change in this entire ticket is one additive
schema field, `User.createdAt`, for the header's "member since" — everything else is
frontend composition over queries that already existed (`authMeUser`, `myReviews`,
`myBadges`).

**Maximize reuse over new components.** Three of the screen's five sections are
existing components used as-is or a same-shaped sibling:
- Stats row: `myReviews/StatsRow.tsx`, imported directly, zero changes.
- Activity chart: the business dashboard's `dashboard/ReviewVolumeChart.tsx`,
  imported directly — it's pure presentational (`{month, reviewCount}[]` in, a
  Recharts bar chart out) with no business-specific coupling, so reusing it across
  the reviewer/business persona split is safe.
- Badge grid: a new `BadgeGrid.tsx`, but a deliberate sibling of `BadgeStrip.tsx`
  (same `myBadges` query, same `lib/badgeIcons.ts` lookup) rather than a
  replacement — `BadgeStrip` stays on My Reviews unchanged. The grid's only real
  difference is always showing each badge's description text instead of a
  hover-tooltip, since "what's left to earn" is the point of a dedicated grid page.

**Recent-reviews preview is a new lightweight card, not `ReviewListItem` reused.**
`ReviewListItem` carries inline edit/delete forms that belong to My Reviews'
management surface. Profile's `RecentReviewsPreview.tsx` shows the 3 most recent
reviews read-only (place, stars, date, snippet) with a "View all" link to
`/app/my-reviews`, reusing `lib/categoryStyles.ts`'s `CATEGORY_STYLES` for the same
place-icon gradient treatment every other review card uses.

**Cover banner is decorative, not a stubbed feature.** No cover-photo concept exists
anywhere in this product (Phase 8 Media is where any real photo upload, avatar
included, eventually lands). Rather than fake a per-user photo or leave the section
out, it's a static brand-gradient bar — chrome, not data. Doesn't need Phase 6
Promotions' "illustrative preview" labeling since it isn't representing an unbuilt
product feature to the user, unlike a fake keyword-mentions chart would be.

**`REGULAR`-only screen, new nav item.** Badges, "businesses reviewed," and review
activity are all reviewer-persona concepts with no `BUSINESS` equivalent (a business
account's own performance view is the Business Dashboard, built in Phase 6). Profile
follows the same persona split every other Phase 4/5 reviewer screen uses: a new
`/app/profile` entry on `REVIEWER_NAV_ITEMS` only, and added to
`REVIEWER_ONLY_PATH_PREFIXES` so a `BUSINESS` account hitting the URL directly
(bookmark, back/forward) gets bounced to `/app/dashboard` like every other
reviewer-only route already does.

## Backend

One additive field, no migration, no new table.

1. **`backend/src/graphql/typeDefs/authTypedefs.ts`**: `User.createdAt: String`
   added. Epoch-millisecond `String`, same convention as every other date on this
   schema (`Review.createdAt`, `Badge.earnedAt`, ...). Resolves via GraphQL's default
   field resolution off the Sequelize model instance `authMeUser` already returns
   (`UserRepository().findByPk(user.id)`) — no resolver change, same mechanism
   `Review.createdAt`/`ReviewReply.createdAt` already rely on. Verified live: the
   field returns a real epoch-ms string, not `null`, for an existing account.

## Frontend

New `routes/app/profile/` folder, five files plus one router/nav wire-up:

1. **`ProfilePage.tsx`** — fetches `authMeUser` (name/userType/profilePicture/
   createdAt), `myReviews` (first: 50, same page size as My Reviews — feeds stats,
   chart, and the recent-reviews preview), and `myBadges`. Composes the five
   sections below.
2. **`ProfileHeader.tsx`** — static gradient cover bar + `UserAvatar` (reused as-is)
   + name + a `REGULAR`/`BUSINESS`-derived role pill + "Member since {date}" (via
   `formatDate.ts`, only rendered when `createdAt` is present).
3. **`activityMonths.ts`** — `groupReviewsByMonth(reviews)`: zero-fills the last 6
   calendar months and counts each review's `createdAt` into its month bucket,
   mirroring `businessDashboardMath.ts`'s `computeMonthlyBuckets`/`monthKey` shape
   but running client-side over `myReviews` rather than server-side over a
   dashboard-scoped query. Feeds `ReviewVolumeChart` directly (same
   `{month, reviewCount}[]` shape its business-dashboard caller already produces).
4. **`BadgeGrid.tsx`** — full 5-badge earned/locked grid; earned badges show their
   `earnedAt` date, locked badges always show their `description` text (not a
   tooltip). Reuses `lib/badgeIcons.ts`.
5. **`RecentReviewsPreview.tsx`** — top 3 `myReviews` rows, read-only, links to the
   place and to `/app/my-reviews`.
6. **`routes/router.tsx`**: `{ path: "profile", element: <ProfilePage /> }`.
7. **`routes/app/AppLayout.tsx`**: `User` (lucide) nav item appended to
   `REVIEWER_NAV_ITEMS`, `"/app/profile"` added to `REVIEWER_ONLY_PATH_PREFIXES`, a
   `SCREEN_META` entry for the header title/subtitle.
8. **`lib/graphql/operations/auth.graphql`**: `AuthMeUser` query picked up the new
   `createdAt` field; regenerated via `npm run codegen` against the live backend.

## Verification

Backend: confirmed `authMeUser`'s `createdAt` field resolves to a real epoch-ms
string (not `null`) for an existing seeded account, via the same default-field-
resolution mechanism already proven by `Review.createdAt`/`Badge.earnedAt` — no
resolver was touched, so this is a schema-only change with a well-established
resolution path, not new logic to re-verify from scratch.

Frontend/backend: `npm run build` (typecheck) passes clean in both `backend/` and
`frontend/`. Per explicit user direction, this repo's UI work does not additionally
require driving a browser to click-test — see the root `CLAUDE.md`'s verification
section.

## Non-goals (explicitly out of scope)

- Any profile editing (name, email, bio, avatar upload) — no `updateUser` mutation
  exists yet; this is Phase 7's job (`04-roadmap.md`).
- A real cover photo / avatar upload — no media/object-storage concept exists yet;
  Phase 8.
- A `BUSINESS`-account variant of this screen — business owners already have the
  Business Dashboard (Phase 6) for their own performance view; nothing here applies
  to that persona.
- Any new backend aggregate/query for stats or activity — deliberately kept
  client-side, consistent with My Reviews' `StatsRow` precedent.
