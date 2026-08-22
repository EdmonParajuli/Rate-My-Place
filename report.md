# Rate My Place — Full QA Pass Report

**Date:** 2026-08-20
**Scope:** Full end-to-end browser QA of the live app (login to logout, every feature), with extra scrutiny on the newly-built QR-to-review feature (Phase 11 — all five tickets). Performed via real browser automation (claude-in-chrome) against the running local stack (backend `http://localhost:4000/graphql`, frontend `http://localhost:5173`), not just code review — the first real click-through this app has had, per this repo's established verification convention (build-clean + code review only, until now).

**Outcome:** 2 real bugs found and fixed, verified both by rebuild and by re-testing live in the browser. 7 edge cases logged for discussion, not fixed. No pre-existing seeded data was touched — all destructive/mutating testing used fresh, disposable test accounts created during this pass. No commits were made; both fixes sit as uncommitted working-tree changes for review.

**Test accounts created (all disposable, safe to ignore or delete):**
- `QA Regular Tester` — REGULAR
- `QR Scan New Customer` — REGULAR, signed up live through the QR scan modal
- `QA Business Owner` / place **"QA Test Business Cafe"** — BUSINESS, via the two-step signup wizard

---

## 1. Testing Log

**Marketing / logged out.** Homepage loaded correctly (hero, live-typing effect, stats). Guest search for "cafe" returned a real result card with a working "View Place" link.

**Unexpected starting state.** Clicking "View Place" from guest search landed on a full authenticated Business Dashboard — the browser already had a persisted session for a seeded account ("Amit Dhakal," BUSINESS, owner of "Nihareeka College Of Management And Technology") from before this pass started. This is correct, intended behavior (`AuthContext`'s refresh-token persistence), not a bug. That session was used to test the BUSINESS persona first.

**BUSINESS persona (Amit Dhakal / Nihareeka College).**
- QR icon confirmed visible in the header, left of the avatar. `/app/qr-code`: QR rendered immediately with no click needed, "Copy Link" put the exact right URL on the clipboard (verified via `navigator.clipboard.readText()`), "Download PNG" produced a real valid PNG (640×640 physical px at 320×320 CSS size — `qrcode.react`'s devicePixelRatio scaling, intentional, not a bug).
- Dashboard and My Listing rendered correctly with real data.
- **Reviews page was broken** — see Bug 1 below. Found, fixed, verified live, including posting a real owner reply afterward.
- Analytics, Promotions (labeled preview), Settings (Account/Password), and Notifications all rendered correctly.
- Logged out — confirmed `localStorage` cleared and `/app/dashboard` correctly bounced to `/login` on the next visit.

**REGULAR signup + persona (fresh: "QA Regular Tester").** Signed up via the real form. Confirmed the QR icon does **not** appear anywhere for this account (a "QR" string spotted once in a page-text dump was a false alarm — turned out to be this account's own avatar initials).
- Discover (search, sort tabs, map view), Categories, Saved, My Reviews, Profile, Notifications, and Settings (all six sections) all rendered correctly.
- Security tab correctly showed exactly one active session.
- Wrote a new review on a real seeded place — rating/count recomputed live in the UI with no manual refresh needed (3.0 → 3.5, 1 → 2 reviews).

**QR scan flow — tested end to end, logged out.**
1. Took the real QR URL from Amit Dhakal's console, logged out, navigated to it directly.
2. Landed on the real place page, dimmed/blurred, with a modal reading "Sign in or create an account to review Nihareeka College..." — exactly as designed.
3. Backdrop click and `Escape` — neither dismissed it. Confirmed non-dismissable.
4. Signed up a new account through the modal. On success: no redirect, no navigation — the modal cleared and the already-open review form became interactive on the same `/r/<token>` URL.
5. Submitted a review as this new customer — posted, rating recomputed live (3.5 → 3.7, 2 → 3 reviews).
6. Re-visited the same QR URL as the same now-authenticated account. **Bug 2 was found here.** After the fix: correct "already reviewed" notice and edit mode with rating/text properly pre-filled.
7. Invalid token (`/r/garbage-token-xyz`) — clean "This QR code isn't valid" state, no crash, no console errors.
8. Confirmed downstream integration: the QR-flow review shows normally in My Reviews (earned a "First Review" badge, triggered a real notification) — nothing QR-specific broke the rest of the app.

**BUSINESS signup wizard (fresh: "QA Business Owner" / "QA Test Business Cafe").** Two-step wizard completed atomically, landed on a genuinely empty dashboard (0 reviews, no phantom data). QR get-or-create confirmed working for a brand-new business too.

**Account mutations tested for real:**
- **Change Password**: updated, logged out, logged back in with the new password successfully.
- **Delete Account** (REGULAR only — confirmed BUSINESS has no Danger Zone tab): typed-confirmation gate works correctly; completing it shows the documented "Preview feature — account deletion isn't implemented yet. Nothing was deleted," matching `docs/04-roadmap.md`. Working as documented, not a bug.
- **Helpful vote toggle**: 0 → 1, confirmed working.
- **Delete Review**: triggers a native `confirm()` dialog that could not be dismissed through any available browser-automation tool — it left that tab genuinely stuck (screenshots, page-text reads, and even tab-close all timed out afterward). Verified the underlying `deleteReview` mutation and rating-recompute both work correctly by calling the GraphQL API directly instead (review soft-deleted, place rating correctly recomputed 3.7/3 → 3.5/2). Abandoned the stuck tab, opened a fresh one, continued testing. See Edge Case 5.

---

## 2. Bugs Found and Fixed

### Bug 1 — Business console's Reviews page always showed "All caught up!", even with real reviews/replies pending

**Where:** `/app/reviews` → `frontend/src/routes/app/reviews/BusinessReviewsPage.tsx`

**Symptom:** "Total Reviews" correctly showed `1`, but "All Reviews" always rendered the empty state instead of the real review — for any business with any reviews at all.

**Root cause:** The page fetches `placeReviews(placeId, first: 1000, sort)` and paginates client-side. `placeReviews` carries `@complexity(value: 1, multipliers: ["first"])`, and its selected `reviewer`/`reply` fields each carry `@complexity(2)` — multiplied by `first`. `first: 1000` against this field selection computes to **complexity 21000** against a server ceiling of **2000** (confirmed directly: `"Query is too complex: 21000. Maximum allowed complexity: 2000"`). Because the complexity plugin throws from Apollo's `didResolveOperation` hook rather than during resolver execution, it bypasses the normal try/catch handling every resolver has and surfaces as a raw **HTTP 500** — Apollo Client's data stays `undefined`, reviews silently default to `[]`, with no visible error anywhere. Every other `first` usage in the frontend is 3–50; this was the one outlier at 1000.

**Fix:** `first: 1000` → `first: 50` (complexity ~1050, safe headroom). Documented inline why, including the failure mode, so it doesn't silently regress.

**Verified:** `npm run build` clean. Live retest: the real review now appears, with the correct "Awaiting Reply" count; posted a real owner reply through the UI and watched the count drop to 0.

### Bug 2 — QR scan repeat-visit landed in edit mode but the form was blank, not pre-filled

**Where:** `/r/:token` scan flow → `frontend/src/routes/app/placeDetail/PlaceDetailPage.tsx` (the Q8 "already reviewed" auto-edit behavior built in ticket 03)

**Symptom:** Repeat-scanning as an account that already reviewed the place correctly showed the "already reviewed" notice and switched to edit mode — but the star rating and textarea were both empty instead of pre-filled with the existing review.

**Root cause:** On the normal `/app/places/:id` flow, `editingReviewId` is set *before* `WriteReviewForm` ever mounts, so its `useState(initialRating ?? 0)`/`useState(initialText ?? "")` lazy initializers capture the right value on their one run. On the QR entry, `writeFormOpen` starts `true` on the very first render (before data has loaded), so `WriteReviewForm` mounts immediately with `editingReview` still `undefined`; the Q8 auto-open effect only sets `editingReviewId` afterward, once data resolves — but React doesn't re-run a `useState` initializer just because the prop it was seeded from later changes.

**Fix:** Added `key={editingReview?.id ?? "new"}` to `<WriteReviewForm>`, forcing a clean remount whenever the identity of what's being edited changes. Harmless on the existing `/app/places/:id` flow, where the key is already correct on first mount.

**Verified:** `npm run build` clean. Live retest: re-scanning now correctly shows the real 4-star rating and review text pre-filled in edit mode.

---

## 3. Edge Cases (Not Fixed — For Discussion)

1. **~~Business-owner signup isn't restricted inside the QR scan modal.~~ Resolved: restricted to `REGULAR` only.** A scanner could previously pick "Business owner" and go through the full 2-step place-creation wizard mid-modal. `SignUpForm` now takes a `restrictToRegular` prop — `ScanAuthModal` passes it, which hides the Reviewer/Business-owner picker entirely and locks `userType` to `REGULAR` (not just pre-selects it, since the picker itself would otherwise still allow switching). `LoginPage`'s normal signup flow is unaffected. Verified via `npm run build` (clean typecheck).

2. **~~`ScanAuthModal` has no focus trap.~~ Resolved.** Background elements (Save button, star rating, textarea, Hours toggle) were still `Tab`-reachable for keyboard/screen-reader users while the modal was up, since nothing marked the background `inert` or trapped focus. Fixed two ways: `PlaceDetailPage` now wraps its content in a `<div inert={...}>` while the modal is mounted (real content, not the modal, so this covers screen-reader virtual-cursor navigation too), and `ScanAuthModal` itself gained a JS Tab/Shift+Tab trap plus initial-focus-on-open, as a defense-in-depth since wrap-around behavior at the ends of the tab order isn't guaranteed by every browser/AT combo. Verified via `npm run build` (clean typecheck).

3. **~~Discover's map view doesn't auto-fit to the listed places.~~ Resolved with a structural change, by request: map view is now gated on real geolocation instead of auto-fitting to place coordinates.** "See in map" now calls `useGeolocation().request()` (`DiscoverPage.handleShowMap`) before switching views. If the user allows location, the map opens centered/zoomed on their own coordinates (a "your location" `CircleMarker`, zoom 13 — `MapView.tsx`), not a whole-place-list average. If they deny (or already have), the view stays on the list and a new `LocationBlockedModal` blocks map access with "Oops! You need to turn on the location to use this feature" (a confused-face badge over a girl-avatar emoji, since no illustration asset exists in this repo for the requested art), a "Turn On Location" retry, and a dismissable "Maybe later" — unlike `ScanAuthModal`'s intentionally-mandatory auth gate, this blocks a nice-to-have view rather than a core flow, so backdrop/Escape/close all work. `useGeolocation.request()` was changed to return a `Promise<Coords | null>` so this flow can await the outcome instead of watching state land asynchronously; the existing "Nearby" sort call site is unaffected. Verified via `npm run build` (clean typecheck).

4. **Dark mode toggle is pre-existing hidden, not something newly broken.** Confirmed in code (`RegularSettingsPage.tsx`): *"Dark Mode toggle temporarily hidden (2026-08-16) — too many visual bugs."* A prior deliberate call, not a fresh discovery here — noted only so it isn't mistaken for a new regression.

5. **~~Native `window.confirm()` for review/draft deletion is inconsistent with the rest of the app's confirmation UX, and is a real testing blind spot.~~ Resolved.** All three bare `confirm(...)` call sites — `MyReviewsPage.tsx`'s review-delete and draft-delete handlers, plus `PlaceDetailPage.tsx`'s own review-delete handler (the same anti-pattern was present there too, not just in `MyReviewsPage.tsx`) — are replaced with a new shared `ConfirmDialog` (`frontend/src/components/ConfirmDialog.tsx`), styled after the existing Danger Zone Cancel/Delete button pair rather than inventing a new visual pattern. It's a real in-DOM modal (backdrop/Escape/close-button dismissable), so it's dismissable through normal browser-automation tooling — unlike the native dialog, which left a QA tab permanently stuck. Verified via `npm run build` (clean typecheck).

6. **`BusinessReviewsPage`'s fix (Bug 1) is a mitigation, not a structural fix.** Lowering `first` to 50 resolves today's breakage, but the fetch-all-then-paginate-client-side approach will hit the same complexity ceiling again around ~90+ reviews for any business, regardless of the specific number chosen. A real fix would move to genuine server-side cursor pagination (the `after`/`pageInfo` shape `placeReviews` already supports), matching how `PlaceDetailPage`'s own review list already works. Out of scope for a bug fix in this pass — flagged here as a real ticket candidate.

7. **A few `AbortError` console exceptions observed on `/app/reviews`**, all timestamped to this session's automated navigation moving faster than real user click-pacing while a query was still in flight. Standard, benign `AbortController` behavior — never surfaced anything visible in the UI. Flagged only because it appeared in the console during testing.
