# Phase 8 Spec: Media Plumbing + Avatar/Cover Upload

**Status: ✅ Built — avatar/cover, place cover photo + gallery, review photo
gallery. Phase 8 complete**, all three `MediaOwnerTypeEnum` values now have a
real, working path.

## Update (2026-08-16): Review photo galleries

Extends `MediaService` to also support `REVIEW` - the last unimplemented
`MediaOwnerTypeEnum` value, closing out Phase 8. `PHOTO` only (no avatar/cover
concept for a review), additive gallery, capped at 6 (`MAX_REVIEW_PHOTOS` -
smaller than a place's 12, since this is one review, not a whole listing).
Ownership checks against the review's own author (`ReviewService.getReviewById`
+ `assertOwnership(review.reviewerId, callerId)`), same shape as the place
ticket's `assertOwnsPlace`.

**A real N+1 risk this time, unlike Place.photos - solved with a materialized
`photoCount`, not a live per-row resolver.** `Place.photos` was safe as a live
resolver because it's only ever fetched for one place at a time (Place Detail,
My Listing). Reviews are different: `placeReviews`/`myReviews` are genuinely
list queries - a place can have dozens of reviews on one page. Embedding a live
`Review.photos` resolver there would fire one `providers_media` query per review
row, the exact anti-pattern this whole media effort has been careful to avoid
(`User.profilePicture`/`Place.coverPhotoUrl` were denormalized specifically to
dodge it). The fix: `Review.photoCount` is a materialized column
(`providers_reviews.photo_count`, migration `20260816180000`), recomputed from
source and stored by `MediaService` on every attach/remove - same "recompute and
store" pattern `ReviewVoteService.toggle` already uses for `helpfulCount`
(literally reused that exact precedent, including recomputing via a real COUNT
query rather than +1/-1, since that's already proven correct here for a
concurrent-write-prone counter). List queries select `photoCount` only (a plain
column, list-safe); the real photo URLs (`Review.photos`, still a live resolver)
are only ever fetched through a new single-review `getReviewById(id)` query -
never embedded in a list, by construction.

**A real bug, caught by testing, not by review.** The first version of
`syncReviewPhotoCount` ran its `COUNT` query without the enclosing transaction -
since the just-created/removed `providers_media` row isn't visible outside that
transaction yet (default `READ COMMITTED` isolation), the recomputed count
silently reflected the *pre-write* state, so `photoCount` never actually updated
on the first attach. Caught by the same real-Cloudinary-upload verification this
whole Phase 8 effort has used throughout (attach a photo, check `photoCount`,
notice it's still 0) - fixed by adding a `transaction` option to
`BaseRepository.count` (it had none before) and passing it through. Confirmed
fixed the same way: attach, count updates; remove, count updates back down.

**Photo management scope: upload/delete lives only in Place Detail's review
composer, not My Reviews' separate inline-edit UI.** `MyReviewsPage.tsx` has its
own self-contained edit UI (`ReviewListItem.tsx`, text/rating only, doesn't
share code with `WriteReviewForm.tsx`) - duplicating the whole upload gallery
there roughly doubles the integration work for a feature that's fully available
from Place Detail either way (editing your own review works from both surfaces,
but only Place Detail's edit form gained the photo section). *Viewing* photos
(read-only) is available everywhere a review appears, though -
`ReviewPhotoStrip.tsx` (`components/`) is shared by both `ReviewCard.tsx` and
`ReviewListItem.tsx`.

**Photos can only be added while editing an existing review, not while writing
a brand-new one.** `attachMedia`'s ownership check needs a real `reviewId` to
verify against - a review that doesn't exist yet has nothing to check ownership
of. Rather than a two-phase "create, then silently unlock photo upload"
transition, `WriteReviewForm` just shows a plain hint ("You can add photos
after posting your review") while writing, and the full `ReviewPhotosSection`
gallery once `isEditing` is true (reached by clicking the pencil icon on your
own published review, which already had a working edit flow). A cleaner
single-submit UX (pick photos while writing, upload them right after
`createReview` resolves) was considered and rejected as more complexity than
the ask warranted - documented here as a deliberate simplification, not a gap.

**`ReviewPhotoStrip.tsx` opens photos in a new tab, not a custom lightbox.**
Clicking a thumbnail is a plain `<a target="_blank">` to the full Cloudinary
URL - avoids building/maintaining a modal/carousel component for a first pass.
Thumbnails themselves are click-to-reveal (a "N photos" toggle expands them),
fetched only at that point via `getReviewById` - so a review list with many
reviews that have photos still costs zero extra queries until a viewer actually
asks to see one.

## Update (2026-08-16): Place photo galleries (real upload, not seeded)

Extends `attachMedia`/`mediaUploadSignature` (previously USER-only) to also
support `PLACE`, so business owners can upload their own cover photo and gallery
for real - not the direct-DB seed from the previous update. My Listing's
"Photo uploads coming soon" placeholder (`ListingPreviewCard.tsx`) had been sitting
there since Phase 6, waiting for exactly this.

**GraphQL surface now carries `ownerType`/`ownerId`, no longer USER-implicit.**
The original avatar/cover ticket deliberately kept `mediaUploadSignature`/
`attachMedia` narrow (self only, no owner arguments at all) rather than
speculatively wiring arguments nothing used yet. Extending to `PLACE` is exactly
the point where that deferred cost comes due - both now take
`ownerType: MediaOwnerTypeEnum!` and an optional `ownerId: Int` (required for
`PLACE`, ignored for `USER` - never trust a client-supplied id for "my own
account"). `REVIEW` still has no working path; the schema enum includes it
(matches doc 3's full shape) but `MediaService` rejects it, same as `PHOTO`
was rejected for `USER` in the first ticket.

**Ownership is checked against the real place, every time.** Both
`getUploadSignature` and `attachMedia` fetch the place via `PlaceService` and
`assertOwnership(place.ownerId, callerId, ...)` before doing anything - the same
check `PlaceService.updatePlace`/`delete` already use. Verified directly: a second
business account attempting to sign or attach media for a place it doesn't own
gets a 403, not just a client-side-hidden button.

**Cover behaves like `USER`'s (single-slot, replace-on-upload); `PHOTO` is a real,
additive gallery, capped at 12.** Setting a new cover deletes the old `COVER` row
and updates `Place.coverPhotoUrl` in the same transaction (identical shape to the
avatar/cover ticket, just parameterized by owner instead of hardcoded to `USER` -
`PlaceService.updateCoverPhoto` mirrors `UserService.updateProfilePicture`).
`PHOTO` uploads are additive - no delete-before-create - since a gallery needs to
accumulate rows. The cap (`MAX_PLACE_PHOTOS = 12` in `mediaService.ts`) is a plain
constant, not asked for explicitly but a reasonable default to stop one place from
accumulating an unbounded number of rows; verified directly (the 13th upload is
rejected with a clear message).

**New `removeMedia(mediaId)` mutation** - deleting an individual gallery photo
needed a real mutation this ticket didn't have before (avatar/cover only ever
*replaced*, never bare-deleted). Ownership resolves by the media row's own
`ownerType`: `USER` checks the caller owns the row directly, `PLACE` checks the
caller owns the underlying place. If the removed row was a `COVER`, the matching
denormalized column (`Place.coverPhotoUrl` or `User.profilePicture`/`coverPicture`)
is cleared to `null` in the same transaction, so it never keeps pointing at a
soft-deleted row's URL - this also means `removeMedia` technically supports
un-setting your own avatar/cover now, even though no UI calls it that way yet
(no "remove avatar" button was built - out of scope, not asked for).

**`Place.photos: [Media]` is a live resolver, not denormalized.** Unlike
`coverPhotoUrl` (needed a column because Discover's grid renders many places at
once), a gallery is inherently a list and is only ever requested for one place at a
time (Place Detail, My Listing) - no N+1 risk to design around here.

**No Figma reference for the gallery UI either.** Same situation as avatar/cover's
camera-icon overlay: neither persona's Figma source predates Phase 8, so
`PlacePhotosSection.tsx` (cover thumbnail + "Change Cover" button, a photo grid
with hover-to-delete, a dashed "Add Photo" tile) is a reasonable, common convention
for a listing-management gallery, not a translation of an existing design.

## Update (2026-08-16): Place cover photo, seeded directly (superseded above)

This update predates the real upload flow above - kept for history. At the time,
`attachMedia` had no `PLACE` support at all, so cover photos were seeded directly
in the DB rather than uploaded. That gap is now closed; new cover photos should go
through the real upload flow in `PlacePhotosSection.tsx`, not another seed script.

The user asked to seed place photos "directly in the db" to check the feature
visually in the UI - both `PlaceCard.tsx` (Discover grid) and
`PlaceDetailPage.tsx` (hero) had placeholder UI explicitly labeled "Phase 8 Media"
already waiting for this, so making seeded data visible required a small real
addition, not just an INSERT:

- **`providers_places.cover_photo_url`** (new column, migration `20260816170000`) -
  same denormalized-read-cache reasoning as `User.profilePicture`/`coverPicture`:
  `PlaceCard` renders many places at once (a Discover grid), so resolving this live
  from `providers_media` per row would reintroduce the exact N+1 this ticket's
  original design avoided for users. `Place.coverPhotoUrl` resolves via plain
  default field resolution, zero resolver code.
- **No write path (no `attachMedia` support for `PLACE`) - seeded directly.**
  Exactly what was asked for: a one-off script (`node -r ts-node/register`, not
  committed, deleted after running) set `cover_photo_url` on 28 existing places to
  a category-matched Unsplash photo, and inserted a matching `providers_media` row
  (`PLACE`/`COVER`) for each so the audit table stays consistent with the real
  upload path's shape - even though nothing reads those rows today (the column is
  the read path). A real place-photo upload ticket, when it lands, should write
  both together the same way `attachMedia` does for users.
- **Frontend**: `PlaceCard.tsx` and `PlaceDetailPage.tsx` both render
  `coverPhotoUrl` when present, falling back to their existing placeholders
  (category-tinted gradient / dashed "Cover photo — Phase 8 Media" box) when not -
  most places still won't have one until a real upload flow exists.
- **Still not built**: any mutation to set a place's cover photo, and the full
  multi-photo `PHOTO` gallery (for both places and reviews) - this is one seeded,
  read-only field, not the place-photo upload ticket itself.

## Context

`docs/04-roadmap.md`'s Phase 8 left three things open: pick an object storage
provider, build the upload flow, and wire it into three consumers (place photos,
review photos, avatar/cover). Doc 6 recommended a **signed upload URL, direct
browser→storage upload** pattern regardless of provider, so this server's Apollo
process never has to handle file bytes.

## Decisions

Both confirmed directly with the user (2026-08-16):

**Cloudinary**, over AWS S3 or Supabase Storage. Lowest setup friction for this
project's stage - no bucket/IAM/CORS to configure, generous free tier, built-in CDN.
The user had already created an account and populated `backend/.env` with
`CLOUDINARY_NAME`, `API_KEY`, `API_SECRET` (plus an unused `CLOUDINARY_URL`) before
this ticket started - `src/config/index.ts` was extended with a `cloudinary` export
using those exact variable names (via the existing `mustExist` fail-fast pattern),
matched to what was already there rather than renamed for cosmetic consistency.

**Sequenced: plumbing + the smallest consumer first**, not everything in one pass.
This ticket builds the `MEDIA` table, the signed-upload mutation, and a reusable
frontend upload flow, proven end-to-end on avatar/cover (a single image each, no
gallery/ordering complexity). Place photos and review photos - both real multi-photo
galleries - are separate, later tickets that reuse this same plumbing.

**Cloudinary's signature flavor of "signed URL."** Cloudinary doesn't hand out a
presigned PUT URL the way S3 does - instead the backend signs a set of upload
params (`folder` + `timestamp`) with the API secret, and the browser POSTs the file
straight to `https://api.cloudinary.com/v1_1/<cloudName>/image/upload` with that
signature plus `api_key`/`file`. Functionally equivalent to doc 6's requirement
(file bytes never touch this server), just Cloudinary's specific mechanism for it.

**`MEDIA` table is the audit trail; `User.profilePicture`/`coverPicture` are the
read path.** `Place.owner`/`Review.reviewer` both embed the full `User` type, and
both already select `profilePicture` in real frontend queries (Place Detail's owner
card, review cards) - resolving `profilePicture` per-request from a `MEDIA` lookup
would be a real N+1 across every review list. Instead, `attachMedia` writes both a
`providers_media` row (kind `AVATAR`/`COVER`) *and* the matching `profile_picture`/
`cover_picture` column on `providers_users`, in the same transaction - the same
"recompute and store a column, don't resolve live" precedent this schema already
uses for `Place.averageRating`/`reviewCount`. `coverPicture` is a genuinely new
column (`cover_picture`, migration `20260816160000`); `profilePicture` already
existed since Phase 1 as an unused column - this ticket is what actually starts
writing to it. Reads stay plain default field resolution off the `User` model
everywhere, zero extra queries, zero resolver changes needed at any existing call
site.

**AVATAR/COVER are single-slot, not a gallery.** `attachMedia` soft-deletes any
existing `MEDIA` row for `(USER, callerId, kind)` before creating the new one, so
uploading a new avatar replaces the old one rather than accumulating rows. `PHOTO`
(place/review galleries) will be genuinely multi-row when that ticket lands - this
delete-before-create behavior is specific to `AVATAR`/`COVER`.

**GraphQL surface is scoped to what's actually implemented - no speculative
`ownerType`/`ownerId` args.** `providers_media`'s columns and `MediaOwnerTypeEnum`
(`PLACE | REVIEW | USER`) already match doc 3's full polymorphic design, since
altering a Postgres enum/table later is more friction than provisioning it now. But
the GraphQL API only exposes `mediaUploadSignature(kind: MediaKindEnum!)` and
`attachMedia(input: { kind, url })` - no owner arguments at all, because every
upload today is implicitly "my own avatar/cover." `MediaService` enforces this
(rejects `kind: PHOTO`); `attachMediaSchema` (Joi) restricts `kind` to
`AVATAR`/`COVER` before the resolver is even reached. Extending to place/review
photos means adding owner arguments then, not now - a normal additive schema change.

**URL validated against this app's own Cloudinary cloud, not just "any URI."**
`attachMedia` has no way to confirm the caller actually went through the
signed-upload flow - the whole point of that flow is this server never sees the file
bytes. `mediaValidators.ts`'s `cloudinaryUrlSchema` requires the URL to match
`^https://res\.cloudinary\.com/<configured cloud name>/`, so a client can't set an
arbitrary external URL as their avatar/cover via this mutation. Verified directly:
a request with a non-Cloudinary URL is rejected before touching the database.

**No Figma reference for this interaction - designed reasonably, not translated.**
Neither persona's Figma source has an avatar/cover upload flow (`ProfileHeader.tsx`'s
old comment explicitly noted this was deferred to "whenever Phase 8 lands"). The
camera-icon overlay on the avatar and the "Change cover" pill on the banner are a
common, reasonable convention, not a 1:1 Figma translation - flagged here per this
session's established practice of being explicit when something wasn't sourced from
a design file.

## Backend

Full vertical slice, same shape as every other feature in this codebase:

1. **Migrations**: `20260816150000-create-media-table.js` (`providers_media`:
   `owner_type` ENUM, `owner_id`, `url`, `kind` ENUM, standard paranoid columns, one
   composite index on `(owner_type, owner_id, kind)`);
   `20260816160000-add-cover-picture-to-users.js` (`cover_picture` TEXT, nullable).
2. **Enums**: `enums/mediaOwnerTypeEnum.ts`, `enums/mediaKindEnum.ts`.
3. **Model/interface**: `models/media.ts`, `interfaces/mediaInterface.ts`;
   `models/users.ts`/`interfaces/userInterface.ts` gained `coverPicture`.
4. **Repository**: `repositories/mediaRepository.ts` (`BaseRepository` +
   `deleteAllForOwner`).
5. **`utils/cloudinary.ts`**: configures the Cloudinary SDK once from
   `config.cloudinary`; `generateUploadSignature(folder)` wraps
   `cloudinary.utils.api_sign_request`.
6. **`services/mediaService.ts`**: `getUploadSignature(userId, kind)` (folder =
   `rate-my-place/users/<userId>/<kind>`) and `attachMedia(userId, {kind, url})`
   (transaction: delete old row, create new row, update the `User` column).
7. **`services/userService.ts`**: added `updateProfilePicture`/`updateCoverPicture`,
   both accepting an optional `transaction` so `MediaService` can call them inside
   its own transaction (mirrors `PlaceService.updateRatingStats`'s signature).
8. **Validator**: `validators/mediaValidators.ts` (`attachMediaSchema`).
9. **typeDefs/resolver**: `graphql/typeDefs/mediaTypedefs.ts`,
   `graphql/resolvers/mediaResolver.ts` - registered in both barrels *and*
   `graphql/schema/index.ts` (that file builds an explicit `buildSubgraphSchema([...])`
   array, not a wildcard over the barrels - easy to miss, cost one debugging round
   trip during this ticket). `authTypedefs.ts`'s `User` type gained `coverPicture`.

## Frontend

1. **`lib/graphql/operations/media.graphql`**: `MediaUploadSignature` query,
   `AttachMedia` mutation. `coverPicture` added alongside every existing
   `profilePicture` selection in `auth.graphql` (Login/SignUp/SignUpBusiness/
   AuthMeUser/UpdateUser).
2. **`lib/media/uploadToCloudinary.ts`**: raw `fetch` POST straight to Cloudinary's
   upload endpoint with the signed params.
3. **`lib/media/useMediaUpload.ts`**: orchestrates signature → Cloudinary upload →
   `attachMedia`, shared by both avatar and cover upload affordances.
4. **`routes/app/profile/ProfileHeader.tsx`**: camera-icon overlay on the avatar,
   "Change cover" pill on the banner; cover now renders the real image when set,
   falling back to the existing gradient bar when not. Calls `onMediaUploaded` (new
   prop) after a successful upload.
5. **`routes/app/profile/ProfilePage.tsx`**: `onMediaUploaded` triggers both
   `refetchMe()` (this page's own `authMeUser` query) and `useAuth().refreshUser()`
   (so `AppLayout`'s topbar/sidebar avatar, which reads from `AuthContext` rather
   than this page's query, updates immediately too - the same two-source-of-truth
   pattern `AccountSection`'s name edit already deals with).
6. **`components/UserAvatar.tsx`**: stale comment fixed (previously said no upload
   flow existed).

## Verification

Backend: `npm run build` (typecheck) clean. Manually exercised end-to-end against
the real Cloudinary account already configured in `.env` - signed up a throwaway
test user, requested a signature, uploaded a real 1x1 PNG directly to Cloudinary
with it, called `attachMedia` with the real returned `secure_url`, confirmed
`authMeUser.profilePicture` reflected it and the old `providers_media` row was
soft-deleted on a second upload (not accumulated). Also confirmed the two
validation guards reject a non-Cloudinary URL and `kind: PHOTO`.

Frontend: `npm run build` (typecheck) clean, `npm run codegen` regenerated
successfully against the live local schema. Per explicit user direction, this
repo's UI work does not additionally require driving a browser to click-test - see
the root `CLAUDE.md`'s verification section.

## Non-goals (explicitly out of scope)

- Place photos, review photos - separate follow-up tickets, reusing this same
  `MEDIA` table/signed-upload plumbing but needing real gallery UI (multiple
  photos, ordering, deletion) that avatar/cover's single-slot model doesn't need.
- Cleaning up orphaned Cloudinary assets when an avatar/cover is replaced - the old
  `providers_media` row is soft-deleted, but the file itself stays on Cloudinary
  (no `cloudinary.uploader.destroy` call). Low cost at this scale (free tier,
  low volume); worth revisiting if storage usage becomes a real concern.
- Image resizing/cropping before or after upload - Cloudinary can do this
  (transformation URLs, upload presets) but nothing here asked for it yet.
- Extending `MediaOwnerTypeEnum` past `USER` on the GraphQL surface - `PLACE`/
  `REVIEW` exist in the enum (matching doc 3's table design) but have no working
  path through `MediaService` or the schema yet.
