# Phase 11 Spec: QR-Code Review Flow — Tickets

**Status: PLANNED, not built.** Written so the shape of the change is agreed before
code gets written — flag anything you'd cut, change, or sequence differently and this
gets revised before touching a single file. Source: a clarifying round with the user
covering ownership, token behavior, review-flow UX, navbar placement, and QR-rendering
tech (2026-08-20) — the full Q&A record lives in the architecture-note artifact
published that session; this doc distills the eleven resolved decisions plus the
rendering-tech pick into buildable tickets.

Each ticket is a **vertical slice**: a thin but complete path through migration →
model → repository → service → resolver (or the frontend equivalent), independently
demoable, following the layering established in
[docs/03-architecture.md](../03-architecture.md).

## Decisions locked in for this phase

| Question | Decision | Why |
|---|---|---|
| Place ↔ QR cardinality | **One active QR per place** — table keyed on `place_id`, not `owner_id` | One listing per business account today; multi-listing accounts (real near-term future scope) need zero schema change later, just more rows |
| Authorization | `requireOwner` + `assertOwnership` against the specific place — **no admin tier in V1** | Admin panel is real future scope, but out of this feature's blast radius |
| Token storage | **Plaintext**, high-entropy | Unlike a password-reset code, a leaked token only ever points at an already-public review form — not a bearer credential worth hashing |
| Regenerate | Issues a **new token**, permanently retires the old one. **Not self-service** — owner can't regenerate their own QR; happens on request, via an internal process | Matches "owner cannot trigger it themselves" exactly — no GraphQL mutation exposed for it in V1 |
| Locking/unlocking | **V2 only** — not built here at all, not even as an inert column | Unlocking is admin-panel-gated and that panel doesn't exist yet; adding it back later is one migration, not a redesign |
| Expiration | **None** — `is_active` boolean is the token's only lifecycle | A sticker lives on a wall for years, unlike a minutes-lived reset code |
| Place deleted/deactivated | **Cascades** — flips the QR's `is_active` to `false` | A scanned sticker for a place that's gone shouldn't quietly keep resolving |
| Scan → auth | Lands directly on the review page's type box; a **full-opacity, non-dismissable auth modal** sits on top (sign up or log in, no skip). Place stays visible, dimmed, behind it | Customer gets instant place confirmation without weakening the login-gated submit path; sidesteps needing a return-to-URL mechanism entirely, since nothing navigates away |
| Review UI | **Reuses `PlaceDetailPage` + `WriteReviewForm`** — no dedicated QR-only screen | One review UI to maintain, not two |
| Repeat scan | Notice ("You've already reviewed this place") **then** edit mode | Not a silent drop into editing |
| Navbar icon | **Hidden entirely** for `REGULAR` accounts | Matches the existing `REVIEWER_NAV_ITEMS`/`BUSINESS_NAV_ITEMS` role fork |
| `source` (counter/table/receipt) | **V2 only** — dropped from the V1 shape entirely | No picker UI, no reason to carry a live-but-unused column |
| QR rendering | **Client-side**, `qrcode.react` canvas variant, drawn on demand from the token's URL — no image ever stored | No QR library exists in the stack today; PNG download falls out of `canvas.toDataURL()` for free, zero backend involvement |

## Cross-cutting design decisions

**No speculative V2 schema.** `locked_reason`, a `status` enum, and `source` were all
drafted at points in the design conversation and explicitly cut once their owning
feature (locking, per-source analytics) was confirmed V2-only — same discipline
Phase 8's media ticket used ("GraphQL surface is scoped to what's actually
implemented — no speculative `ownerType`/`ownerId` args"). `review_qr_codes` ships
with exactly the columns V1 uses.

**Regenerate is a service method, not a GraphQL mutation.** Because it's explicitly
not self-service, there's nothing for the owner-gated resolver to expose. V1 needs
the *capability* (so a regenerate request doesn't mean raw SQL), not a UI trigger —
`PlaceReviewQrService.regenerate(placeId)` gets invoked via a one-off script when
support needs to run it, same precedent as Phase 8's place-photo seeding ("a one-off
script, not committed, deleted after running"). A real trigger (admin-panel button,
support tool) is future scope, not this phase's problem.

**The scan route reuses `PlaceDetailPage` in place, branching on which param is
present.** `/app/places/:placeId` (existing, authenticated) and `/r/:token` (new,
public) both mount the same component. Reading a `token` param instead of `placeId`
switches the data source from `getPlaceById` to the new public
`placeByReviewToken` query and forces the write form open on mount — no second
review UI, per the locked decision above.

**No return-to-URL plumbing gets built.** `PrivateRoute`'s missing
"come back here after auth" mechanism was flagged as a gap during design, but the
modal-on-the-same-route approach sidesteps it entirely — auth resolves in place,
`AuthContext` updates, the already-rendered form (previously inert behind the modal)
goes interactive. Nothing navigates away and back.

**`placeByReviewToken` returns the same `Place` shape `getPlaceById` does**, not a
stripped-down public type. The whole point of the decision above is that the scan
lands on the *real* review page — inventing a second, narrower place type would
undercut that and require a second frontend rendering path.

---

## Ticket 01 — `review_qr_codes` backend slice

**Status: ✅ Done** — built and manually verified end to end against a live server
(2026-08-20), not yet committed. See "What was actually built" below for two
deviations from the plan as originally written.

### Why

Everything else in this phase depends on a place being able to resolve to a QR
record and back. This ticket is pure plumbing — no public surface yet.

### What to build

- **Migration**: `<timestamp>-create-review-qr-codes-table.js`. Columns: `id` (pk),
  `place_id` (fk → `providers_places`), `public_token` (string, unique, indexed),
  `is_active` (boolean, default `true`), `created_by` (fk → `providers_users`),
  standard `created_at`/`updated_at`/`deleted_at` (paranoid, matching every other
  table). Partial unique index on `place_id` `WHERE is_active` — one live QR per
  place, same pattern `20260815170000-make-reviews-unique-index-partial.js`
  already established for one-review-per-place-per-reviewer.
- **Interface**: `interfaces/reviewQrCodeInterface.ts`, mirroring `PlaceInterface`'s
  shape (`InputReviewQrCodeInterface` / `ReviewQrCodeInterface` /
  `ReviewQrCodeModelInterface`).
- **Model**: `models/reviewQrCodes.ts`.
- **Repository**: `repositories/reviewQrCodeRepository.ts`, extends `BaseRepository`.
  Only extra method needed: `findActiveByPlaceId(placeId)`.
- **Service**: `services/reviewQrCodeService.ts`
  - `getOrCreateForPlace(placeId, requestingUserId)` — `assertOwnership` against the
    place first (same shape as `PlaceService.updatePlace`), then
    `findActiveByPlaceId`, creating one (`public_token` via
    `crypto.randomBytes(24).toString("hex")`, same generator `authService.ts`
    already uses for reset codes) if none exists.
  - `regenerate(placeId)` — creates a new active row, sets the previous active row's
    `is_active` to `false` in the same transaction. No `requestingUserId` param —
    this is never called from a resolver (see cross-cutting decision above).
  - `deactivateForPlace(placeId, transaction)` — flips the active row's `is_active`
    to `false`. Called from `PlaceService.delete` (Ticket 01b below).
- **Validator**: none needed — `getOrCreateForPlace` takes no client-supplied input
  shape beyond the already-authenticated caller's own place.
- **GraphQL**: `graphql/typeDefs/reviewQrCodeTypedefs.ts` +
  `graphql/resolvers/reviewQrCodeResolver.ts`, registered in both barrels and
  `graphql/schema/index.ts`'s explicit array (easy to miss — cost a debugging round
  trip on the Phase 8 media ticket, worth re-flagging here).
  - `Query.myReviewQrCode: ReviewQrCodeResponse` — `requireOwner`, resolves the
    caller's place via the existing `PlaceService.getByOwnerId` pattern, then
    `getOrCreateForPlace`. Returns `{ publicToken, createdAt }`. No mutation.

### Ticket 01b — Cascade on place delete (Q6, folded in — same service, small)

- `PlaceService.delete` gains a call to
  `ReviewQrCodeService.deactivateForPlace(placeId, transaction)` inside its existing
  delete path, before/alongside the place's own soft-delete.

### What was actually built (two deviations from the plan above)

**`getOrCreateForOwner(requestingUserId)`, not `getOrCreateForPlace(placeId,
requestingUserId)` + a separate `assertOwnership` call.** The plan mirrored
`PlaceService.updatePlace`'s shape on the assumption this needed the same
"re-fetch and assert" guard. Implementing it surfaced the actual difference:
`updatePlace` defends against a *client-supplied* `placeId` that could belong to
someone else. `myReviewQrCode` never takes one — it resolves "my place" via
`PlaceService.getByOwnerId(requestingUserId)`, already scoped to the caller by its
own `WHERE ownerId = callerId`. Nothing untrusted ever crosses this boundary, so
there's nothing left to assert — `getOrCreateForOwner` does the resolution and the
get-or-create in one pass, one fewer DB round trip than the original sketch.

**A real bug, caught by booting the server, not by review.** `PlaceService` and
`ReviewQrCodeService` each constructed the other inside their own constructor
(`PlaceService`'s constructor built a `ReviewQrCodeService` field for
`Ticket 01b`'s cascade call; `ReviewQrCodeService`'s constructor builds a
`PlaceService` for `getOrCreateForOwner`/`regenerate`) — infinite mutual
recursion, stack overflow on every server start. Fixed by not holding
`ReviewQrCodeService` as a `PlaceService` constructor field at all — `delete()`
instantiates one locally instead, so only one direction of the dependency is ever
constructed eagerly.

### Acceptance criteria

- [x] Migration applies and reverts cleanly — `db:migrate` / `db:migrate:undo` both
      verified against the dev DB; `\d providers_review_qr_codes` confirmed the
      partial index reads `UNIQUE (place_id) WHERE is_active = true`
- [x] `myReviewQrCode` as a `BUSINESS` caller with a place returns a token, creating
      one on first call and the same one on every call after — verified against a
      real seeded account (minted a JWT directly, no password needed)
- [x] `myReviewQrCode` as a `REGULAR` caller is rejected (`UNAUTHORIZED`)
- [x] `myReviewQrCode` as a `BUSINESS` caller who owns a *different* place never sees
      another business's token — proven structurally (`getByOwnerId` scopes by
      caller id) rather than by a second-account test
- [x] Deleting a place (`deletePlace`) deactivates its QR — verified with a
      disposable test place: `is_active` flipped `true` → `false` in the same
      transaction as the place's own soft-delete. (The "subsequent
      `placeByReviewToken` lookup comes back not-found" half of this criterion is
      now also verified — see Ticket 02 below.)
- [x] `npm run build` passes
- [x] Bonus, not in the original list: the DB-level partial unique index itself was
      verified directly — a manual `INSERT` of a second active row for a place that
      already had one was rejected with `duplicate key value violates unique
      constraint`, confirming this isn't only application-logic-enforced

### Blocked by

None.

---

## Ticket 02 — Public token resolution (backend)

**Status: ✅ Done** — built exactly as planned, no deviations. Manually verified
end to end against a live server (2026-08-20), not yet committed.

### Why

The scan route (Ticket 03) needs a way to go from "token in a URL" to "a place,"
without requiring login — `getPlaceById` requires auth today, so it can't be reused
as-is for this entry point.

### What to build

- **`ReviewQrCodeService.resolveActiveToken(token)`** — looks up an active,
  non-deleted `review_qr_codes` row by `public_token`, returns its `place_id` (or
  `null`/throws `NOT_FOUND` if the token doesn't resolve — covers unknown,
  deactivated, and superseded tokens with one check, since all three simply fail to
  match `WHERE is_active`).
- **GraphQL**: `Query.placeByReviewToken(token: String!): PlaceResponse` on the
  existing `placeTypedefs.ts`/`placeResolver.ts` (this is a `Place`-shaped query,
  not a QR one — belongs next to `getPlaceById`, not in the QR slice). **No
  `requireAuth`** — public, matching `listPlaces`'s existing precedent, not
  `getPlaceById`'s. Resolves the token via `ReviewQrCodeService`, then delegates to
  the existing `PlaceService.getPlaceById` — same `Place` type, same field
  resolvers (`owner`, `category`, `hours`, `openNow`, ...), nothing new to maintain
  on the read side.

### Acceptance criteria

- [x] `placeByReviewToken` with a valid, active token returns the same shape
      `getPlaceById` would for that place — no login required. Verified with no
      `Authorization` header sent at all, against a real seeded place's real token
- [x] An unknown token returns a clear `NOT_FOUND`, not a crash
- [x] A deactivated token (place deleted, or a superseded pre-regenerate token)
      returns `NOT_FOUND` too — same handling, no separate "expired" state to
      distinguish (there isn't one — see Q5). Verified with a disposable
      `is_active: false` row
- [x] `npm run build` passes

### Blocked by

Ticket 01 (needs `ReviewQrCodeService`/repository to exist) — done, see above.

---

## Ticket 03 — Public scan route + mandatory auth modal (frontend)

### Why

This is the actual "scan → review" moment — the highest-value, highest-risk ticket
in the phase. Everything before this is plumbing; everything after this is the
business-facing half of the feature.

### What to build

- **New top-level route**, sibling to the existing `MarketingLayout`/`PrivateRoute`
  entries in `router.tsx`: `{ path: "r/:token", element: <PlaceDetailPage /> }` —
  deliberately outside both `MarketingLayout` (no marketing chrome belongs on a
  scan-and-go flow) and `PrivateRoute` (must render before login).
- **`PlaceDetailPage` branches on which route param is present.** Reading `token`
  instead of `placeId`:
  - Sources data from `usePlaceByReviewTokenQuery` instead of
    `useGetPlaceByIdQuery`.
  - Forces `writeFormOpen = true` on mount, skips rendering the "Write a Review"
    trigger button entirely — already in review mode, nothing to click into.
  - If `myReview` already exists for this place (see Ticket 01's shape — this reuses
    the same `reviews` data the page already fetches), shows a brief notice
    ("You've already reviewed this place") and opens the existing edit-mode path
    (`editingReviewId` set) instead of create mode — reuses `openEditForm()`
    verbatim, just auto-triggered instead of click-triggered.
  - The existing owner self-review guard (`isOwner` → "Business owners can't write
    reviews for their own listing") still applies unchanged if the scanning account
    happens to be this place's own `BUSINESS` owner.
- **New `ScanAuthModal` component**: full-viewport, high-opacity overlay,
  non-dismissable (no backdrop click-through, no close button, no `Escape` handler).
  Renders `SignInForm`/`SignUpForm` (reused from `routes/auth/`, same tab pattern
  `LoginPage.tsx` already has) inside. Mounted whenever `!user` on the `/r/:token`
  route only — the existing `/app/places/:id` path is untouched, still gated by
  `PrivateRoute` exactly as today.
- **No interactivity behind the modal is specially disabled** — the modal's own
  `position: fixed; inset: 0` overlay is what prevents interaction; the form
  underneath doesn't need its own disabled-state logic.
- On successful sign-in/sign-up inside the modal, nothing navigates — `AuthContext`
  updates, the modal unmounts (`user` now truthy), the already-rendered form becomes
  the only thing left on screen.

### Acceptance criteria

- [ ] Scanning (visiting `/r/:token` directly) while logged out shows the real place
      — name, photo, rating — dimmed behind the modal; the type box is visible but
      inert
- [ ] The modal cannot be dismissed without completing sign-up or sign-in (no
      backdrop click, no Escape, no close affordance)
- [ ] Completing sign-up or sign-in clears the modal and the review form becomes
      interactive, on the same page — no redirect
- [ ] An already-authenticated customer who hasn't reviewed this place lands
      straight on an empty, open write form
- [ ] An already-authenticated customer who *has* reviewed this place sees the
      notice, then lands in edit mode on their existing review
- [ ] The place's own `BUSINESS` owner scanning their own code sees the existing
      owner-view treatment, not a review form they can't submit to
- [ ] An invalid/deactivated token shows a clear "not found" state, not a crash
- [ ] `npm run build` passes

### Blocked by

Ticket 02.

---

## Ticket 04 — Business console: QR page (view / download / copy)

### Why

The owner-facing half — where the QR in Ticket 01 actually becomes something a
business can put on a wall.

### What to build

- **New route**, e.g. `/app/qr-code`, added to `router.tsx`'s existing `/app`
  children — **not** added to `BUSINESS_NAV_ITEMS`'s sidebar array. Reached solely
  via the header icon (Ticket 05), matching "shouldn't disturb the existing navbar
  layout."
- Calls `myReviewQrCode` on mount (get-or-create is silent/automatic — no empty
  state, no "Generate" button, per the locked decision above).
- Composes the shareable URL client-side: `` `${window.location.origin}/r/${token}` ``
  — nothing server-side needs to know its own domain (no `FRONTEND_URL` config
  exists today, and this avoids ever needing one).
- **New dependency**: `qrcode.react`. Renders `<QRCodeCanvas value={url} />`.
- **Download as PNG** — `canvas.toDataURL('image/png')` off the same canvas the
  component renders, triggered via an anchor `download` attribute. No second
  library, no SVG-to-PNG conversion step.
- **Copy link** — `navigator.clipboard.writeText(url)`, a toast/inline confirmation
  on success (matching this codebase's existing toast/notice conventions rather
  than a bare `alert`).
- **No regenerate button** — per the locked decision, this isn't self-service in V1.

### Acceptance criteria

- [ ] A `BUSINESS` account visiting `/app/qr-code` for the first time sees a QR
      immediately, no click needed to create it
- [ ] The QR encodes a URL that, scanned, actually reaches Ticket 03's flow for the
      right place
- [ ] "Download PNG" produces a real, scannable PNG file
- [ ] "Copy link" puts the exact same URL on the clipboard
- [ ] A `REGULAR` account cannot reach this route usefully (either redirected, or
      the underlying query rejects with `UNAUTHORIZED` and the page shows a clear
      state — not a crash)
- [ ] `npm run build` passes

### Blocked by

Ticket 01.

---

## Ticket 05 — Navbar icon

### Why

The discoverability path into Ticket 04 — small, but the one piece of this phase
touching a screen every business account already sees constantly.

### What to build

- `AppLayout.tsx`'s header (the topbar, not the sidebar footer — this is the
  "navbar" with the avatar at the far right) gains a `QrCode` icon (lucide-react,
  already the app's only icon system — no new icon dependency) immediately left of
  the existing `UserAvatar` + name block.
- Rendered only when `user?.userType === "BUSINESS"` — hidden entirely for
  `REGULAR`, matching `REVIEWER_NAV_ITEMS`/`BUSINESS_NAV_ITEMS`'s existing role
  fork.
- Links to `/app/qr-code` (Ticket 04).
- No layout shift to the existing avatar block — same header row, icon added as a
  sibling before it.

### Acceptance criteria

- [ ] `BUSINESS` accounts see the icon in the header, immediately left of their
      avatar, on every `/app/*` screen
- [ ] `REGULAR` accounts never see it, on any screen
- [ ] Clicking it reaches Ticket 04's page
- [ ] Existing header layout (avatar, name, sidebar collapse toggle) is visually
      unchanged otherwise
- [ ] `npm run build` passes

### Blocked by

Ticket 04.

---

## Non-goals (explicitly out of scope for this phase)

- **Locking/unlocking** a QR — V2, confirmed, not even a schema column here.
- **Per-source labeling/analytics** (counter/table/receipt) — V2, confirmed, not a
  schema column here either.
- **Multiple QR codes per place** — the schema (keyed on `place_id`, not `owner_id`)
  leaves room for it, but V1 ships exactly one active QR per place, enforced by the
  partial unique index.
- **A self-service regenerate button anywhere in the UI** — the service method
  exists (Ticket 01); nothing calls it except an internal script.
- **An admin panel** for unlocking/regenerating — real future scope, referenced but
  not built.
- **Google/social sign-in inside the scan auth modal** — flagged for v3/v4;
  V1's modal is email/password only, reusing the existing `SignInForm`/`SignUpForm`.
- **Expiration/TTL on tokens** — confirmed none; `is_active` is the only lifecycle.
