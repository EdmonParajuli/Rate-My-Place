# Phase 6 Spec: Business Dashboard

**Status: 📝 Plan — not yet implemented.** This is the implementation plan for
Phase 6, reconciling the Figma Make output against the real codebase, the same
role [phase-4-frontend-mvp.md](./phase-4-frontend-mvp.md) played for the previous
phase. Written for review before any code changes land.

## Context

Phase 4 (frontend MVP) shipped Discover, Categories, Place Detail, My Reviews, Auth,
and the Marketing landing page. Business owners currently get the exact same shell
as regular users, with dashboard work explicitly deferred (Phase 4's own decision
log: "no dashboard placeholder to build and discard — Business Dashboard is Phase 6").

As prep for this phase, [phase-6-business-dashboard-figma-prompt.md](./phase-6-business-dashboard-figma-prompt.md)
(written earlier, not yet acted on) was fed into Figma Make, producing a fresh design
at `https://www.figma.com/make/oVTXc2TbEHvaGM5mVXL6L1/Design-Rate-My-Business-UI`. Its
generated source (`BusinessDashboardHome.tsx`, `BusinessDashboardLayout.tsx`, pulled via
Figma's `get_design_context`) matches the prompt closely: 4 KPI cards (Reputation
Score, Avg Rating, Total Reviews, Response Rate), a rating-trend area chart + review-
volume bar chart (Recharts), a review list with "Needs Response"/"All Reviews" tabs
and an inline reply composer, a 3-bar sentiment breakdown, insight cards, and a static
Pro upsell banner.

Two reconciliations against the real codebase, both already anticipated by the prep
doc:
- The generated design invented its own sidebar/branding ("RateMyBiz", 6 nav items).
  The prep doc explicitly asked to reuse the real shell instead — this spec follows
  that, not the generated layout.
- "Sentiment... analysed via NLP" — real NLP is out of scope. Using a rating-bucket
  heuristic instead (4-5★ positive / 3★ neutral / 1-2★ negative), consistent with
  this project's established "start simple" calls (Haversine over PostGIS, static
  marketing stats, etc.).

The Reputation Score formula was an explicit open product decision
([04-roadmap.md](../04-roadmap.md)'s "Open questions"). Decided: **weighted
composite** (rating + volume + recency + response rate), not a simple rating-only
score.

Reuse win found during research: Phase 4's Place Detail screen already built the
exact owner-reply UI this dashboard needs
(`frontend/src/routes/app/placeDetail/ReviewCard.tsx`, `isOwnerViewing` prop) on top
of the exact GraphQL operations this needs (`placeReviews`, `createReviewReply`,
already wired end-to-end). The dashboard's review-management section reuses that
component and those operations directly instead of building new ones.

## Reputation Score formula (0–100, weighted composite)

Computed live in the service layer (not materialized — same "recompute from source"
precedent as `Category.avgRating`/`Place.ratingBreakdown`):

- **Rating (55%)**: `(averageRating / 5) * 100`
- **Volume/confidence (20%)**, diminishing returns, full marks ~100 reviews:
  `100 * min(1, ln(reviewCount + 1) / ln(101))`
- **Response rate (15%)**: `repliedReviews / totalReviews * 100`
- **Recency/activity (10%)**, full marks at 5+ reviews in the last 90 days:
  `100 * min(1, reviewsLast90Days / 5)`

`reputationScore = round(0.55*rating + 0.20*volume + 0.15*response + 0.10*recency)`

**Trend deltas** (KPI cards' "+4 pts this month" style, all 4 KPIs): re-run the exact
same pure aggregation function against the dataset filtered to `createdAt <= end of
last month`, diff against the live (unfiltered) result. One function, two calls — no
separate monthly-cohort machinery, no historical snapshots to store.

**Insights** (2-3 cards): rule-based, evaluated against the same computed
aggregates — e.g. response-rate-improved-this-month, best-month-yet-by-volume,
rating-dipped-this-month. No text/keyword mining (the Figma mock's "reviews mention
wait times" line is dropped — would require real NLP). Fixed priority list, take up
to 3 matches, sensible fallback string if none match.

## Backend

New feature, following the existing vertical-slice + "thin passthrough" conventions
(see `PlatformStatsService`/`platformStatsResolver`/`platformStatsTypedefs` as the
closest precedent — an orchestration-only service with no repository of its own,
composing existing services).

**No new tables/migrations** — everything derives from `providers_reviews` +
`providers_reviews_replies`, already fully populated.

1. **`backend/src/services/placeService.ts`**: add `getByOwnerId(ownerId)` — thin
   passthrough to `this.repository.findOne({ where: { ownerId } })`. (A business
   account owns exactly one place today, created atomically by `signUpBusiness` —
   same assumption the dashboard's single-business Figma design makes.)

2. **`backend/src/services/reviewService.ts`**: add `getForDashboard(placeId)` —
   thin passthrough to `this.repository.findAll({ where: { placeId }, attributes:
   ['id', 'rating', 'createdAt'] })`. Lightweight rows, aggregated in JS (below).

3. **`backend/src/services/reviewReplyService.ts`**: add `getForReviews(reviewIds)`
   — thin passthrough to `this.repository.findAll({ where: { reviewId: { [Op.in]:
   reviewIds } }, attributes: ['reviewId', 'createdAt'] })`.

4. **`backend/src/services/businessDashboardService.ts`** (new, orchestration-only,
   same shape as `PlatformStatsService`): composes `PlaceService`/`ReviewService`/
   `ReviewReplyService`.
   - `getDashboard(userId): Promise<BusinessDashboardStats>`
   - Fetch place (404 if none), reviews, replies (2 lightweight queries total).
   - Pure helper functions (co-located or a small `businessDashboardMath.ts`) compute,
     from the in-memory `reviews`/`replies` arrays: monthly rating-trend + review-volume
     buckets (last 12 months, zero-filled gaps like `getRatingBreakdown` does), sentiment
     breakdown, response rate, reputation score (+ all 4 trend deltas via the "re-run
     filtered to last month" approach above), and insights.

5. **`backend/src/graphql/typeDefs/businessDashboardTypedefs.ts`** (new):
   `BusinessDashboardStats` (placeId, placeName, reputationScore + trend,
   averageRating + trend, reviewCount + trend, responseRate + trend,
   `ratingTrend: [MonthlyRatingPoint]`, `reviewVolume: [MonthlyVolumePoint]`,
   `sentiment: SentimentBreakdown`, `insights: [String]`), wrapped in the standard
   `BusinessDashboardResponse { message, data }` envelope. `extend type Query {
   businessDashboard: BusinessDashboardResponse }` — **no args**, derives the place
   from `context.user.id` (mirrors `myReviews`), avoiding an IDOR surface entirely
   rather than accepting a caller-supplied placeId.

6. **`backend/src/graphql/resolvers/businessDashboardResolver.ts`** (new): `requireOwner(context)`
   (role check), call `new BusinessDashboardService().getDashboard(user.id)`, wrap via
   `SuccessResponse.send`, same try/catch → `GraphQLError` translation as every other
   resolver.

7. Wire into `backend/src/graphql/typeDefs/index.ts`, `resolvers/index.ts`,
   `graphql/schema/index.ts` — same barrel-export pattern as every existing feature.

## Frontend

1. **New dependency**: `recharts` (already named in `docs/05-frontend-plan.md`'s
   stack decision, not yet installed) — add to `frontend/package.json`.

2. **GraphQL operations** — `frontend/src/lib/graphql/operations/businessDashboard.graphql`
   (new): `query BusinessDashboard { businessDashboard { data { ...all fields } } }`.
   Reuses the *existing* `placeDetail.graphql`'s `PlaceReviews` query and
   `CreateReviewReply` mutation for the review-management section — no new
   operations needed there. Run `npm run codegen` after adding the new operation.

3. **Route + nav** — `frontend/src/routes/router.tsx`: add `{ path: "dashboard",
   element: <BusinessDashboardPage /> }` under the existing `AppLayout` children.
   `frontend/src/routes/app/AppLayout.tsx`: `BUSINESS` accounts get their **own** nav
   (just `Dashboard`, LayoutDashboard icon) instead of Discover/Categories/My Reviews
   with Dashboard appended — reverses Phase 4's "identical nav for both user types"
   decision, made back when there was nothing business-specific to show. A `BUSINESS`
   account landing directly on a reviewer-only path (`/app`, `/app/categories`,
   `/app/my-reviews`) gets redirected to `/app/dashboard`; `/app/places/:id` stays
   reachable (the Dashboard's "View Listing" link depends on it). Regular users' nav
   is unchanged. See [phase-6-business-console-figma-prompt.md](./phase-6-business-console-figma-prompt.md)
   for the fuller business-console direction this is the first step of.

4. **`frontend/src/routes/app/dashboard/BusinessDashboardPage.tsx`** (new) +
   subcomponents (`KpiCard.tsx`, `RatingTrendChart.tsx`, `ReviewVolumeChart.tsx`,
   `SentimentBreakdown.tsx`, `InsightCard.tsx`, `UpsellBanner.tsx`), styled to match
   the Figma reference (white cards, `rounded-2xl`, existing Tailwind tokens from
   `frontend/src/index.css` — same palette already locked in for every Phase 4
   screen, not re-extracted). Review-management section renders `placeReviews`
   results through the **existing** `ReviewCard` component
   (`frontend/src/routes/app/placeDetail/ReviewCard.tsx`) with `isOwnerViewing=true`,
   filtered client-side into "Needs Response" (no `reply`) vs "All Reviews" tabs —
   same client-side-filter precedent as My Reviews' stats row.

5. Upsell banner ships fully static (no plan/billing system exists anywhere in this
   product) — cosmetic only, same treatment as the marketing page's hardcoded stats.

## Docs to update once built

- `docs/04-roadmap.md`: check off Phase 6 items as they land; resolve the
  "Reputation score formula" open question with a pointer to this spec.
- `docs/03-architecture.md`: add a "Planned → Built: Business Dashboard aggregation"
  section (same pattern as the existing Category cover-image section).

## Verification plan

- Backend: `npm run build` (typecheck), then `npm run start:dev` and exercise
  `businessDashboard` directly via GraphQL introspection/Playground as a BUSINESS
  user — confirm the shape and that numbers look sane (reputationScore in [0,100],
  sentiment percentages sum to ~100, monthly arrays have 12 zero-filled entries).
- Frontend: `npm run codegen`, then run the dev server and click through as a
  business-owner account: Dashboard nav item appears (business only), KPI
  cards/charts render with real data, reply flow on a review works and immediately
  reflects in "Needs Response" → "All Reviews".

## Non-goals (explicitly out of scope for this phase)

- Real NLP sentiment analysis (heuristic bucketing instead, see above).
- Multi-place business accounts / a place switcher (Figma design and today's
  `signUpBusiness` flow both assume one place per business owner).
- Any billing/plan system behind the "Upgrade to Pro" banner (static/cosmetic only).
- The Figma design's other nav destinations (My Listing, Reviews, Analytics,
  Promotions, Settings) — only "Dashboard" ships; everything else stays absent from
  the nav rather than shipped as a dead placeholder link.
