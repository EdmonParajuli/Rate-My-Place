# Place detail + write/edit review

Type: prototype
Status: closed
Claimed by: current session, 2026-08-12
Blocked by: [Design tokens](01-design-tokens.md)

## Question

What should the place-detail screen look like and behave like — place info, the
reviews list, the write/edit-review flow, and (per this map's charting session) the
owner-reply flow?

Backend support that already exists: `getPlaceById`, `placeReviews` (paginated),
`toggleHelpfulVote` (helpful-vote toggle on each review), `createReview`/
`updateReview`/`deleteReview`, and `createReviewReply` for owner replies (all from
Phase 2). This map's charting session decided owner replies are **included** in
Phase 4 — a BUSINESS-type owner viewing their own place should be able to reply to a
review here, not wait for the Phase 6 dashboard.

Review photos are explicitly **out of scope** (Phase 8 Media) — the write/edit-review
form is text + star rating only.

Use `/prototype` (UI branch) grounded in the Figma nodes for this screen
(`get_design_context`, `figma-design-to-code` skill, fileKey
`uecnUKqT4CI7LuIpWo50Pp`).

**Note from the Design tokens ticket**: fetching `get_design_context` with
`nodeId "0:1"` on this fileKey returned only the authenticated "core app" screens
(`Screen` type: discover/categories/category-detail/my-reviews/saved/notifications/
profile/settings) — no place-detail screen was in that source tree, same gap as the
Marketing landing page and Auth screens tickets. Start this ticket by figuring out
where place-detail actually lives in the Figma Make project before assuming the
design-tokens ticket's fetch already covers it.

## Resolution

**Verdict: Variant A** — faithful port of the real Figma source: full-width
cover (generic placeholder, not a real photo), two-column body with reviews +
rating-breakdown overview on the left, place info/similar-places/owner-info
sidebar on the right.

**Important correction to the visitor/owner toggle, not to be missed when this
gets built for real**: the toggle shown in the prototype (and in the real
Figma source, which itself labels it `{/* Viewer mode toggle — demo affordance
*/}`) is a **throwaway demonstration device only**. In the real system, a user
must **never** be able to manually switch between "visitor" and "owner"
perspectives — viewer mode has to be derived automatically from auth context:
`isOwner = currentUser.id === place.owner.id`. No toggle UI ships to
production.

Gaps reconciled against real backend fields (full reasoning in Comments below):
cover/logo photos → generic placeholder (Phase 8 Media); amenity pills →
illustrative placeholder only, given its own new
[Phase 10](../../../docs/04-roadmap.md); owner response-rate → placeholder
text (overlaps Phase 6's undecided formula). New backend scope now recorded in
[03-architecture.md](../../../docs/03-architecture.md)'s "Planned: Place Detail
follow-ups" section: `ReviewReply.createdAt`, a `sort` arg on `placeReviews`
(new `ReviewSortEnum`), and a live-computed rating-breakdown aggregate.

Prototype committed to throwaway branch `prototype/place-detail-review`
(commit `0e7746c`), out of `main` per the prototype skill's capture step.

## Comments

**Correction (2026-08-13)**: the resource-listing re-check noted below turned
out to be premature — a **full re-fetch of `App.tsx` found a real, complete
`PlaceDetailScreen` component that did not exist the day before.** The `Screen`
union now includes `"place-detail"`, new icons are imported (`Send`,
`CornerDownRight`, `MessageCircle`, `Flag`), and `BusinessCard`'s "View
Business" button now has a real `onClick={onView}` wired to it — none of which
were there on 2026-08-12. The file was actively edited (very likely via Figma
Make, using [phase-4-place-detail-figma-prompt.md](../../../docs/specs/phase-4-place-detail-figma-prompt.md))
between the two checks. Lesson: the resource-listing endpoint alone isn't
sufficient to rule a screen out — worth a full-file re-fetch when a screen is
suspected to have been added, not just re-checking the file list.

The real `PlaceDetailScreen` is thorough and well-built: cover image + logo,
a built-in **visitor/owner mode toggle** (exactly the demo affordance every
other ticket on this map had to build by hand), a rating-breakdown bar chart,
hours accordion, two-column body (reviews + rating overview on the left,
place info/similar-places/owner-info sidebar on the right), full write/edit/
delete review flow, helpful-vote toggle, and a complete owner-reply composer.
Ported faithfully wherever real backend support exists.

**Gaps found reconciling against real backend fields, and decisions made**:
- **Cover/logo photos → generic placeholder, not real per-place images.**
  `Place` has no image fields; full photo support is Phase 8 Media (real
  infrastructure — object storage, signed URLs), not a one-column addition
  like Categories' `coverImageUrl` was. Rendered as a plain pattern/icon box,
  not a stock photo that could pass as real content.
- **Amenity pills ("Great for laptops," "Dog-friendly," etc.) → shown as
  illustrative placeholders only, not wired to any field.** No backend
  concept exists anywhere. Given its own new roadmap phase —
  [Phase 10 — Place attributes & amenities](../../../docs/04-roadmap.md) —
  rather than forced into Phase 4 or dropped permanently.
- **Owner "response rate" badge → placeholder text, not computed.** Same
  metric Phase 6's own roadmap item already flags as a not-yet-decided
  formula for the Business Dashboard; computing an ad-hoc version here first
  risked two screens disagreeing on what it means.
- **Reply timestamp** — `ReviewReply` has no `createdAt` exposed yet; small
  new scope (the column already exists via this project's standard
  `created_at` convention, just needs a GraphQL field).
- **Review sort (Most Recent/Most Helpful)** — `placeReviews` has no `sort`
  arg today; new scope, mirrors `listPlaces`' existing `PlaceSortEnum`
  pattern (a new `ReviewSortEnum`).
- **Rating breakdown bars (5★→1★ counts)** — no backend field; same
  treatment as Categories' `businessCount`/`avgRating` — a new live-computed
  aggregate (`GROUP BY rating COUNT` for the place), not materialized, same
  "recompute from source" precedent as `Place.averageRating` itself.
- **Save/heart, "Report listing"** — both omitted. Save/heart is out of
  scope project-wide (Phase 5). "Report listing" has no moderation pipeline
  anywhere in this project — not even a client-only stand-in makes sense
  without somewhere for a report to go, so dropped rather than left as a
  dead button (same reasoning as why Marketing's dead `userAuth` signal
  wasn't silently built either).
- **Helpful vote, owner reply, write/edit/delete review** — all faithful
  1:1 ports; real backend capability already exists for every one
  (`toggleHelpfulVote`, `createReviewReply`, `createReview`/`updateReview`/
  `deleteReview`).

3 structurally different layout variants — the review-management **logic**
(visitor/owner toggle, write/edit/delete, helpful vote, owner reply) is
identical and shared across all three; only the visual structure differs:
- **A** — faithful port of the real source: full-width cover, two-column body
  (reviews left, info sidebar right).
- **B** — split header (condensed image+info side by side, no full-width
  banner), write-review composer pinned always-visible instead of button-
  triggered, single-column body (no persistent sidebar).
- **C** — tabbed Overview/Reviews: compact summary header, Overview tab
  (description, amenities, hours, contact, similar places) separate from
  Reviews tab (breakdown + list + write/edit + owner replies).

Hosted inside the exact approved shell from ticket 04. No sidebar nav item is
marked active — Discover, Categories, and My Reviews can all lead here, so
none is uniquely its "parent" — a real "Back" button in the header returns to
Discover instead.

Prototype: `.scratch/phase-4-frontend-mvp/prototypes/place-detail-review/index.html`
(`?variant=A/B/C`).
