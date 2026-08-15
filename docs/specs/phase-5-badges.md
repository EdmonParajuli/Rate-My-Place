# Phase 5 Spec: Badges

**Status: ✅ Built.** Second ticket of Phase 5 — Personalization, built ahead of
Notifications and Profile per explicit direction (Profile's badge grid needs real
badge data to not ship as a permanent stub). See
[03-architecture.md](../03-architecture.md)'s "Built: Badges" section for the
condensed version.

## Context

[specs/phase-5-saved-places.md](./phase-5-saved-places.md) shipped the first of
Phase 5's four independent features. Per `04-roadmap.md`: **"`BADGES`/`USER_BADGES` —
start with 3-5 real criteria, not the full grid from the design."** The Figma source
([01-vision-and-scope.md](../01-vision-and-scope.md) item 6) describes a full
achievement/badge grid on a Profile screen that doesn't exist yet.
`frontend/src/routes/app/myReviews/StatsRow.tsx` had a standing comment: the Figma
design's 4th stat card, "Contribution Level: Elite," was deliberately dropped
("Phase 5 badges concept, no backend support exists") — this ticket is what unblocks
that.

## Two decisions

Both confirmed directly with the user before implementation:

**Badges are permanent once earned.** Standard achievement semantics — once a
threshold is crossed, `providers_user_badges` gets a row with a stable `earned_at`;
nothing is ever removed even if the underlying stats later drop (e.g. every
triggering review gets deleted). Verified live: drove a test account to all 5
badges, deleted every one of its reviews (`myReviews` went back to empty), re-queried
`myBadges` — all 5 stayed earned.

**Frontend surface for this ticket is My Reviews, not a new Profile screen.** Profile
doesn't exist yet (it's the next Phase 5 ticket). Rather than block Badges on Profile,
or ship badges backend-only with zero visible surface, a compact badge strip was
added to the existing My Reviews page — the exact slot the Figma "Contribution Level:
Elite" stat card was already dropped from. The full badge grid (earned vs. locked,
with descriptions) stays reserved for the Profile ticket; this gives Badges one real,
visible touchpoint now.

## Design

**Badge catalog is a small static, code-defined set — not a designer-configurable
rules engine.** `providers_badges` is a real, migration-seeded table (so
`UserBadge` rows can FK to it and the catalog is queryable), but the *criteria
evaluation* lives in one small map in `badgeService.ts`, not in a `criteria` column
something has to parse — same "start simple" precedent
`businessDashboardMath.ts`'s reputation-score formula already set.

**5 badges**, all computed from data that already exists on `providers_reviews`
(reusing exactly the 3 numbers `StatsRow.tsx` already computes client-side):

| key | label | criteria |
|---|---|---|
| `FIRST_REVIEW` | First Review | `reviewCount >= 1` |
| `PROLIFIC_REVIEWER` | Prolific Reviewer | `reviewCount >= 10` |
| `HELPFUL_REVIEWER` | Helpful Reviewer | `helpfulVotesReceived >= 10` |
| `EXPLORER` | Explorer | `distinctPlacesReviewed >= 5` |
| `ELITE_REVIEWER` | Elite Reviewer | `reviewCount >= 10 AND helpfulVotesReceived >= 25` |

**Awarding is check-on-read, not hooked into every mutation.** A single
`BadgeService.getForUser(userId)` call (backing the `myBadges` query): fetch the
user's current stats via one new repository query, evaluate all 5 criteria, for any
badge that's newly true and not yet in `UserBadge`, insert it (`earned_at = now`) —
then return the full catalog annotated with `earned`/`earnedAt` per badge. No hooks
were added to `ReviewService.createReview`/`deleteReview` or
`ReviewVoteService.toggle` — a badge becomes visible the next time `myBadges` runs
(i.e. the next time My Reviews loads), not the instant the triggering write happens.
Acceptable since there's no toast/notification infra yet (that's the next ticket).

## Backend

New vertical slice — two tables, no toggle (badges are earn-only, unlike
`ReviewVote`/`SavedPlace`).

1. **`backend/src/enums/badgeKeyEnum.ts`**: `FIRST_REVIEW | PROLIFIC_REVIEWER |
   HELPFUL_REVIEWER | EXPLORER | ELITE_REVIEWER`.
2. **Migration** `20260815180000-create-badges-tables.js`:
   - `providers_badges(id, key ENUM(...) UNIQUE, label, description, icon, created_at,
     updated_at, deleted_at)` — `paranoid: true` like every other reference table.
     Seeded directly in the migration's `up` via `bulkInsert` (the 5 rows above).
   - `providers_user_badges(id, user_id FK, badge_id FK, earned_at NOT NULL,
     created_at)` — `paranoid: false` (an earned badge is a permanent fact, nothing
     to soft-delete), unique index on `(user_id, badge_id)` — the insert-guard that
     makes a badge earnable only once per user.
   - `down` drops both tables + the orphaned `enum_providers_badges_key` Postgres
     enum type.
3. **Models/interfaces**: `badges.ts`/`badgeInterface.ts` (mirrors `categories.ts`'s
   `paranoid: true` shape), `userBadges.ts`/`userBadgeInterface.ts` (mirrors
   `savedPlaces.ts`'s `paranoid: false, updatedAt: false` shape).
4. **Repositories**: `badgeRepository.ts`/`userBadgeRepository.ts` — bare
   `BaseRepository` extensions, no bespoke methods.
5. **`ReviewRepository.getReviewerStats(reviewerId)`** (new method, added alongside
   the existing `getRatingStats`): one aggregate query per stat
   (`this.model.count`/`this.model.aggregate('helpfulCount','sum',...)`/
   `this.model.aggregate('placeId','count',{distinct:true},...)`), returning
   `{reviewCount, helpfulVotesReceived, distinctPlacesReviewed}`. Exposed through a
   thin `ReviewService.getReviewerStats` passthrough — `BadgeService` depends on
   `ReviewService`, not on `ReviewRepository` directly, same layering
   `ReviewVoteService` already follows.
6. **`badgeService.ts`**: the `CRITERIA` map (5 entries) plus `getForUser` as
   described above. One implementation gotcha worth recording: `catalog.map((badge) =>
   ({...badge, earned, earnedAt}))` silently returned `null` for every real field —
   spreading a live Sequelize model instance doesn't reliably copy its
   getter-defined attributes. Fixed by spreading `(badge as any).get({ plain: true })`
   instead; every other resolver in this codebase avoids the problem by returning
   model instances untouched rather than copying them.
7. **Typedefs** `badgeTypedefs.ts`: `BadgeKeyEnum`, `Badge{id, key, label,
   description, icon, earned, earnedAt}`, `BadgeListResponse`, a single
   `myBadges: BadgeListResponse` query (no args — derives caller from
   `context.user.id`, same no-IDOR-surface choice `myReviews`/`savedPlaces` made). No
   mutations — badges are never directly written by the client.
8. **Resolver** `badgeResolver.ts`: `requireAuth`, standard try/catch →
   `GraphQLError` translation, `Query.myBadges` calls `BadgeService.getForUser`.
9. Wired into the usual `typeDefs`/`resolvers`/`schema` barrel exports.

## Frontend

1. **`badges.graphql`** (new): `MyBadges` query pulling every `Badge` field.
2. **`frontend/src/lib/badgeIcons.ts`** (new): `Record<string, LucideIcon>` mapping
   the 5 seeded icon-name strings to lucide components — same lookup pattern
   `lib/categoryIcons.ts` already established for `Category.icon`.
3. **`frontend/src/routes/app/myReviews/BadgeStrip.tsx`** (new): compact row of 5
   badge pills — earned ones in full color with the lucide icon and a formatted
   earned date, locked ones greyed with the criteria description in a `title`
   tooltip. `Badge.earnedAt` is a `String` epoch-millisecond field like every other
   date on this schema, rendered via the existing `formatDate.ts` helper.
4. **`frontend/src/routes/app/myReviews/MyReviewsPage.tsx`**: `useMyBadgesQuery()` +
   `<BadgeStrip badges={...} />` rendered directly under `<StatsRow />`.
5. No router/nav changes — rides on the existing My Reviews screen.

## Verification

Backend, exercised live via GraphQL as a fresh REGULAR account: `myBadges` returned
all 5 locked, no `UserBadge` rows created. Wrote 10 reviews across 10 distinct
places — `FIRST_REVIEW`, `PROLIFIC_REVIEWER`, and `EXPLORER` all flipped to earned
with real `earnedAt` timestamps, `HELPFUL_REVIEWER`/`ELITE_REVIEWER` stayed locked.
Had 3 separate accounts helpful-vote across those reviews (30 total votes) —
`HELPFUL_REVIEWER` (≥10) and `ELITE_REVIEWER` (≥10 reviews AND ≥25 helpful votes)
both flipped. Deleted all 10 reviews (`myReviews` confirmed empty) and re-queried
`myBadges` — all 5 badges stayed earned, proving permanence. Separately confirmed a
brand-new account still starts fully locked.

Frontend, click-tested in-browser: My Reviews for the all-badges account rendered the
strip with all 5 pills in the earned (colored, dated) state; a fresh zero-badge
account rendered all 5 in the locked (greyed, "Locked") state.

## Non-goals (explicitly out of scope)

- Live/instant badge-earned notification at the moment a review or vote is written —
  awarding is check-on-read only (see Design above). Ties into the not-yet-built
  Notifications ticket, not this one.
- The full Profile-screen badge grid (earned vs. locked with descriptions, activity
  chart context) — this ticket's frontend surface is intentionally the smaller
  My Reviews strip, not a new screen.
- Any badge criteria beyond the 5 shipped (e.g. photo uploads, check-ins) — no
  backing data exists yet for anything beyond review/vote counts.
