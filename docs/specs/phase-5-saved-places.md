# Phase 5 Spec: Saved Places

**Status: ✅ Built.** First ticket of Phase 5 — Personalization, and the plan the
implementation actually followed. See [03-architecture.md](../03-architecture.md)'s
"Built: Saved Places" section for the condensed version.

## Context

Phase 6 (Business Dashboard + full business console) had just merged to `main`.
Phase 5 covers four largely independent features (`SAVED_PLACES`, `NOTIFICATIONS`, a
Profile screen, `BADGES`) — rather than plan all four together, this covers just the
first: Saved Places, the simplest and closest to an existing pattern
(`ReviewVote`'s toggle-join-table shape). Discover and Place Detail had no save/heart
affordance at all before this — nothing to reconcile against, a clean build.

Source for what the screen needs: [01-vision-and-scope.md](../01-vision-and-scope.md)'s
reviewer-side feature list, item 4: **"Saved — four tabs (All Saved / Want to Visit /
Reviewed / Favorites), cards with list-type badge, hover-reveal remove, saved date."**

## Two decisions

**List-type taxonomy** (asked directly — a real data-model fork): a saved place gets
exactly **one** list type — `SAVED` (the default, i.e. plain "All Saved" with no
sub-category) / `WANT_TO_VISIT` / `FAVORITE` — not two independent flags. Matches the
real-world semantics (you haven't been yet, or you have and loved it — naturally
exclusive) and keeps the model to one row per `(user, place)` with a single enum
column, same shape `Place.priceRange`/`PriceRangeEnum` already uses.

**"Reviewed" is not a 4th list type and never touches `SAVED_PLACES` at all** — this
was a mid-implementation revision. The original plan had Reviewed as a computed
*intersection* of saved-and-reviewed places (i.e. still requiring the user to have
saved the place first). That's not the intended behavior: submitting a review should
make a place appear under Saved → Reviewed **immediately**, with no save/heart action
required, and deleting the review should remove it immediately. Since nothing about
"reviewed" is ever stored in `providers_saved_places`, there's nothing to keep in
sync — Reviewed is simply the **existing** `myReviews` query, reused and rendered as
place-cards instead of review-cards. This also means:
- A place appearing in Reviewed never creates a `SAVED`/`WANT_TO_VISIT`/`FAVORITE`
  row, and saving a place never affects Reviewed.
- The Reviewed tab needed **zero new backend** — only a frontend query extension
  (more fields on `myReviews`'s existing `place` selection) to render full cards.

## Backend

New vertical slice, closely following `ReviewVote`'s existing shape
(`backend/src/{models,repositories,services,graphql/{typeDefs,resolvers}}/reviewVote*`)
as the closest precedent — a pure toggle join table, `paranoid: false` (row exists =
saved, absent = not, so un-saving hard-deletes), unique index on `(user_id, place_id)`.

1. **`backend/src/enums/savedListTypeEnum.ts`**: `SAVED | WANT_TO_VISIT | FAVORITE`.
2. **Migration** `20260815160000-create-saved-places-table.js`:
   `providers_saved_places(id, user_id FK, place_id FK, list_type ENUM(...) NOT NULL
   DEFAULT 'SAVED', created_at)`, unique index on `(user_id, place_id)`, `down` drops
   the table + the orphaned Postgres enum type.
3. **Model** `savedPlaces.ts` + **interface** `savedPlaceInterface.ts` — same shape as
   `reviewVotes.ts`/`reviewVoteInterface.ts`.
4. **Repository** `savedPlaceRepository.ts` — a bare `BaseRepository` extension, no
   bespoke query methods needed.
5. **Service** `savedPlaceService.ts`:
   - `toggle(userId, placeId)` — mirrors `ReviewVoteService.toggle`: delete-if-exists
     / create-with-`SAVED`-if-not. No transaction needed (unlike `ReviewVote`'s
     toggle) since there's no derived/materialized count to keep in sync elsewhere.
   - `setListType(userId, placeId, listType)` — re-categorize; `NOT_FOUND`/404 if not
     currently saved.
   - `getForUser(userId)` — unfiltered fetch; the `ALL`/`WANT_TO_VISIT`/`FAVORITE`
     tab split happens as a plain JS filter over this one result set in the resolver
     (same "start simple, compute in memory" precedent as `businessDashboardMath.ts`).
   - `hasSaved(placeId, userId?)` — mirrors `ReviewVoteService.hasVoted`, backs the
     `Place.savedByMe`/`savedListType` field resolvers.
6. **Typedefs** `savedPlaceTypedefs.ts`: `SavedListTypeEnum`, `SavedPlaceFilterEnum`
   (`ALL | WANT_TO_VISIT | FAVORITE` — deliberately no `REVIEWED` value, which is what
   makes "Reviewed never touches `SAVED_PLACES`" a structural guarantee rather than a
   convention to remember), `SavedPlace`/`SavedPlaceListResponse`/`SavedPlaceResponse`
   types, `extend type Place { savedByMe, savedListType }`,
   `savedPlaces(filter)` query (no other args — derives the caller from
   `context.user.id`, same no-IDOR-surface choice `myReviews`/`businessDashboard`
   already made), `toggleSavePlace`/`setSavedPlaceListType` mutations.
7. **Resolver** `savedPlaceResolver.ts` — `requireAuth` throughout (no `requireOwner`;
   either account type can save places), `SavedPlace.place` field resolver via
   `PlaceService.getPlaceById`, `Place.savedByMe`/`savedListType` field resolvers via
   `SavedPlaceService.hasSaved` mirroring `Review.helpfulByMe` exactly.
8. Wired into the usual `typeDefs`/`resolvers`/`schema` barrel exports.

## Frontend

1. **`savedPlaces.graphql`** (new): `SavedPlaces(filter)`, `ToggleSavePlace`,
   `SetSavedPlaceListType`. Extended `places.graphql`/`placeDetail.graphql` with
   `savedByMe savedListType`. Extended `myReviews.graphql`'s `place` selection with
   the rest of what a place-card needs (`address priceRange averageRating
   reviewCount isVerified openNow trendingScore category{icon}`) so the Reviewed tab
   can render full cards from data that already existed.
2. **`frontend/src/components/SaveHeartButton.tsx`** (new, shared like
   `UserAvatar.tsx`): a self-contained heart toggle — local state seeded from the
   `initialSaved` prop, updated directly from the mutation's flat
   `{savedByMe, listType}` response. No refetch, no Apollo cache surgery — same shape
   `ReviewCard`'s existing helpful-vote button uses for an analogous flat-response
   toggle mutation.
3. **`discover/PlaceCard.tsx`**: heart button overlaid top-right on the image (the
   one piece of `01-vision-and-scope.md`'s "business cards with save/heart toggle"
   that wasn't built yet).
4. **`placeDetail/PlaceDetailPage.tsx`**: same heart button near the header, hidden
   for the owner viewing their own listing (self-save makes no more sense than
   self-review, which is already blocked).
5. **`routes/app/saved/SavedPage.tsx`** + **`SavedPlaceCard.tsx`** (new): 4 tabs.
   All Saved/Want to Visit/Favorites read from one `savedPlaces(filter: ALL)` fetch,
   filtered client-side per tab; Reviewed reads from `useMyReviewsQuery` instead,
   with no remove/re-categorize affordance (there's no saved-place row to act on —
   the card just reflects a review that exists elsewhere). `SavedPlaceCard` wraps the
   **existing** `PlaceCard` component with a thin meta-row (badge, saved/reviewed
   date, hover-reveal remove, re-categorize buttons) rather than a from-scratch card.
   Reusing `PlaceCard` directly across three different GraphQL operations works
   because every field on the generated types is optional — an object missing a few
   fields the wider type declares is still structurally assignable.
6. **`router.tsx`**: `{ path: "saved", element: <SavedPage /> }`.
7. **`AppLayout.tsx`**: `Saved` added to `REVIEWER_NAV_ITEMS` (Heart icon, between
   Categories and My Reviews) and `REVIEWER_ONLY_PATH_PREFIXES` (a `BUSINESS`
   account landing on `/app/saved` directly gets redirected to their own console,
   same guard as Categories/My Reviews already have) + a `SCREEN_META` entry.

## Verification

Backend, exercised live via GraphQL as a fresh REGULAR account: saved a place
(defaults to `SAVED`), re-categorized to `WANT_TO_VISIT`, saved a second place and
re-categorized to `FAVORITE`; confirmed `savedPlaces(filter: ALL)` returned both and
each single-category filter returned exactly the matching one; confirmed
`Place.savedByMe`/`savedListType` field resolvers matched. Then, specifically for the
Reviewed-tab behavior: confirmed a third place had `savedByMe: false`, wrote a review
for it with no save action, confirmed it appeared in `myReviews` immediately while
`savedPlaces(filter: ALL)` and `Place.savedByMe` stayed unchanged (proving reviewing
never touches `SAVED_PLACES`); deleted the review and confirmed `myReviews` emptied
immediately. Un-toggled a save and confirmed it dropped out of `savedPlaces(ALL)`.

Frontend, click-tested in-browser as the same account: heart toggle on a Discover
card fills/unfills and persists after reload; the Place Detail heart button works
the same way; wrote a real review through the UI on a never-saved place and watched
it appear under Saved → Reviewed with no prior save action; re-categorized a saved
place from the "All Saved" tab's "Move to Want to Visit" button and confirmed it
moved tabs; hover-revealed and clicked the remove button and confirmed the place
dropped out of every list.

## Non-goals (explicitly out of scope)

- A place being saved under more than one list type simultaneously (the "single list
  type per save" decision above).
- Any UI for browsing *other users'* saved lists — this is a private, single-user
  feature, same as My Reviews' drafts.
- Fixing the pre-existing `providers_reviews` unique-index bug found during
  verification (see [02-current-state.md](../02-current-state.md)'s "Still open"
  list) — unrelated to this ticket.
