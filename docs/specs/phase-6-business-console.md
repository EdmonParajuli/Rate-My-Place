# Phase 6 Spec: Business Console (My Listing, Reviews, Analytics, Promotions, Settings)

**Status: ✅ Built.** This is the implementation record for the five business-console
pages beyond the Dashboard home screen — the ones
[phase-6-business-console-figma-prompt.md](./phase-6-business-console-figma-prompt.md)
asked Figma Make to design, and the ones `BUSINESS_NAV_ITEMS` in
`frontend/src/routes/app/AppLayout.tsx` already linked to as placeholders since the
nav change that followed the Dashboard build. See
[phase-6-business-dashboard.md](./phase-6-business-dashboard.md) for the Dashboard
home screen itself, and [03-architecture.md](../03-architecture.md)'s "Built:
Business console pages" section for the condensed version of everything below.

## Context

The Figma prompt's own grounding table already sorted each page into "fully real",
"partially real", or "not real at all" against the backend as it existed before this
work started. That grounding held up well against the generated designs — the
per-page sections below record exactly what backend capability existed, what (if
anything) each page reconciles away from the Figma mock, and what shipped as an
explicitly-labeled illustrative preview instead of real functionality.

**No new backend code was written for any of these five pages.** Every mutation and
query they needed already existed: `updatePlace`, `setPlaceHours`, `getPlaceById`
(including `ratingBreakdown`), `categories`, `placeReviews`, `createReviewReply`,
`changePassword`, and the Dashboard's own `businessDashboard` query. This was a pure
frontend build.

## My Listing

`frontend/src/routes/app/myListing/MyListingPage.tsx` + `ListingPreviewCard.tsx`.

Two-column layout: edit form (Basics / Contact & Location / Pricing / Hours) on the
left, a live preview card on the right mirroring exactly how Discover/Place Detail
render a place. Backed entirely by existing mutations:

- `updatePlace(placeId, input: InputPlace)` for name/category/description/address/
  phone/website/price range. `InputPlace`'s validator (`createPlaceSchema`, shared
  with place creation) requires `label`/`address`/`phone`/`categoryId` on every call
  — the form always has all four filled, so this reuses cleanly. Note the pre-existing
  `address` field's 25-character max (an already-shipped constraint on the same
  schema place creation already goes through, not something introduced here) — the
  form shows a live character counter so this isn't a surprise validation error.
- `setPlaceHours(placeId, hours: [InputPlaceHour!]!)` — whole-week replace, so closed
  days are simply omitted from the submitted array. Hours use native
  `<input type="time">` (gives exactly the `"HH:mm"` string `setPlaceHours`'s Joi
  schema already accepts) instead of the Figma mock's custom 30-minute-increment
  `<select>` — simpler, more accessible, no reason to hand-roll it.
- Category dropdown sources from the real `categories` query, not the Figma mock's
  hardcoded category-name list.
- Price tiers map to the real `PriceRangeEnum` (`LOW`/`MEDIUM`/`HIGH`), not a
  freeform `$`/`$$`/`$$$` string.
- No photo/logo uploader — no media infrastructure exists yet (Phase 8). The preview
  card shows an explicit "Photo uploads coming soon" placeholder, matching what the
  prep prompt asked for.

Dirty-state tracking mirrors the Figma mock's baseline-diff approach: a `seededRef`
guard seeds `form`/`hours` state once when `getPlaceById` first resolves, and both
`updatePlace` and `setPlaceHours` fire together on Save, followed by a refetch.

## Reviews

`frontend/src/routes/app/reviews/BusinessReviewsPage.tsx`.

A fuller version of the Dashboard's review list, not a different design language —
same `ReviewCard`/`isOwnerViewing` reuse. Differences from the Dashboard's miniature
version:

- Stats strip (total reviews, average rating, awaiting reply) — total/average come
  from `businessDashboard`'s already-computed stats (the authoritative source, not
  recomputed from whatever page of reviews happens to be loaded); awaiting-reply is
  counted from the fetched review set.
- Sort reuses the real `ReviewSortEnum` (`RECENT`/`HELPFUL`) server-side, not the
  Figma mock's client-side rating sort masquerading as "Most Helpful".
- Filter (All / Needs Response) + client-side pagination, same shape as the
  Dashboard's filter tabs.

Fetches `placeReviews(placeId, first: 1000, sort)` — `1000` is the pagination
package's `MaxLimit`, effectively "all reviews for this place" at MVP volume, same
"start simple" call the Dashboard's review section already made rather than building
server-side "needs response" filtering.

## Analytics

`frontend/src/routes/app/analytics/AnalyticsPage.tsx` + `RatingDistributionChart.tsx`.

Split cleanly along the prep prompt's own line:

- **Real**: rating-trend area chart and review-volume bar chart reuse the
  Dashboard's `RatingTrendChart`/`ReviewVolumeChart` components directly, fed from
  `businessDashboard`'s existing 12-month arrays sliced client-side to 3/6/12 months
  for the date-range selector (no new backend — the data was already computed
  monthly, only ever displayed as "last 12" before). The rating-distribution chart
  reuses `Place.ratingBreakdown`, the same field Place Detail's `RatingOverview`
  already renders.
- **Illustrative only**: keyword mentions and competitor benchmark have zero backend
  behind them — no NLP/keyword-extraction pipeline and no cross-business comparison
  query exist anywhere in this product. Shipped as static sample panels, blurred,
  with a "Sample data · Pro" badge and an "Unlock with Pro" overlay — the same
  honesty treatment as the Dashboard's `UpsellBanner`, never presented as if it were
  live data.

## Promotions

`frontend/src/routes/app/promotions/PromotionsPage.tsx` +
`frontend/src/lib/promotionsStore.ts`.

**Not real at all, by design** — the prep prompt flagged this page as purely
exploratory, since no promotions/offers/monetization concept exists anywhere in this
product's docs or backend. Built as a fully client-side preview:

- `promotionsStore.ts` persists to `localStorage`, keyed by `placeId`, same
  client-side-only precedent `frontend/src/lib/drafts.ts` already established for My
  Reviews' Drafts tab — never touches the API.
- Promotion status (Active/Scheduled/Ended) is derived live from `startDate`/
  `endDate` on every render, not stored and left to go stale like the Figma mock did.
- The page carries an explicit banner: "Preview feature — promotions you create here
  are saved only to this browser, not published anywhere."

## Settings

`frontend/src/routes/app/settings/SettingsPage.tsx`.

Split down the middle within the Account tab itself:

- **Real**: Change Password is a fully working `changePassword` flow. It passes the
  caller's stored refresh token as `input.refreshToken` — `AuthService.changePassword`
  revokes all other sessions on a password change but preserves the one whose refresh
  token it was given, so the business owner isn't logged out by changing their own
  password. Verified live: session survived a hard reload immediately after.
- **Reconciled away from the Figma mock**: name/email editing. The prep prompt's
  grounding table assumed these would map to a real update mutation; investigating
  the backend found no `updateUser`/`updateProfile` mutation exists at all (only
  `authMeUser` read and `changePassword` write). Rather than ship a form with a Save
  button that silently no-ops, the Account tab shows name/email/account-type as
  **read-only** fields sourced from `useAuth()`'s `user`, with a note that they can't
  be changed from here yet.
- **Illustrative only**: the Notifications tab's four toggles are static, in-memory
  only — `NOTIFICATIONS` is still Phase 5 and unbuilt, so there's nothing real for
  them to wire up to. The tab carries an explicit caption saying so, same honesty
  treatment as Promotions' banner.

This is deliberately a narrower slice than the full [Phase 7](../04-roadmap.md)
settings vision (2FA, data export, delete account, blocked users, account-type-agnostic
profile editing) — see the note added to Phase 7 in the roadmap.

## Verification

Verified live end to end against a fresh BUSINESS account (`signUpBusiness`) seeded
with three reviews (ratings 5/4/2) across separate REGULAR accounts:

- My Listing: edited name/description/hours (toggled Monday open, set times), saved,
  confirmed `updatePlace` + `setPlaceHours` both landed via a refetch, "Saved" state
  and "Last saved" timestamp updated.
- Reviews: replied to a review, confirmed "Needs Response" count dropped from 3 to 2
  and the reply rendered with the "Owner" badge.
- Analytics: confirmed the rating-distribution bars matched the seeded ratings
  (1×5★, 1×4★, 1×2★) and the Pro-preview panels render blurred with the overlay.
- Promotions: created a promotion, confirmed it listed under "Active" with the
  correct computed status.
- Settings: changed the password, confirmed success and that a subsequent hard
  reload kept the session logged in (same StrictMode fix from the Dashboard phase
  still holding).
- Nav: confirmed all six items (Dashboard, My Listing, Reviews, Analytics,
  Promotions, Settings) render for the BUSINESS account in the sidebar.

## Non-goals (explicitly out of scope)

- Real NLP keyword extraction or a cross-business competitor-benchmark query
  (Analytics' Pro panels stay static previews).
- A real promotions/offers backend (out of scope for the entire product right now,
  not just this phase).
- `updateUser`/`updateProfile` mutation (name/email editing) — Settings shows
  read-only fields instead; building this mutation is Phase 7 work, account-type-
  agnostic, not scoped to the business console alone.
- Real notification delivery (`NOTIFICATIONS` table/resolver is Phase 5).
