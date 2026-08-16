# Phase 5 Correction: Profile + Notifications Persona/Design Fixes

**Status: ✅ Built.** A third round of the same class of mistake the Settings
correction (see [specs/phase-7-settings-account-edit.md](./phase-7-settings-account-edit.md)'s
Correction section and [specs/phase-7-settings-security-sessions.md](./phase-7-settings-security-sessions.md))
already caught and fixed — checked directly by the user, not self-caught, against
both Figma sources ([03-architecture.md](../03-architecture.md)'s condensed version
lives under this same heading).

## Context

Once Settings' business/regular design mixup was fixed, the user asked directly
whether Profile and Notifications had the same problem. They did, in two different
ways:

- **Profile's "Review Activity" chart** reused `dashboard/ReviewVolumeChart.tsx` — a
  bar chart whose design originates from the *business* dashboard. The regular-user
  Figma's own Profile screen (`uecnUKqT4CI7LuIpWo50Pp`'s `ProfileScreen()`) uses a
  smooth gradient-filled **area chart** for this exact section — visually and
  structurally different, not the same component with different data.
- **Notifications** shares one component (`NotificationsPage.tsx`, 2 tabs: All/
  Unread) across both account types. `BUSINESS`'s own Figma shell
  (`oVTXc2TbEHvaGM5mVXL6L1`'s `BusinessDashboardLayout.tsx`) has **no Notifications
  nav item or page at all** — just a bell icon + unread dot in the top header bar.
  The regular-user Figma has the dedicated full-page nav item this codebase built,
  with a richer design than what shipped: 6 category tabs (All/Reviews/Likes/
  Replies/Recommendations/System) and avatar-first rows, vs. the shipped 2 tabs and
  plain icon rows.

## Decisions

**Profile: unambiguous fix, no product decision needed.** Swap the chart component
for one matching the source. `ProfileActivityChart.tsx` (new) replaces
`ReviewVolumeChart` in `ProfilePage.tsx` — a gradient `AreaChart`, not a `BarChart`.
Still fed by the same client-side `activityMonths.ts` bucketing (`{month,
reviewCount}[]`) from Phase 5 — no backend change.

**Notifications: BUSINESS stays exactly as-is; REGULAR gets rebuilt against its own
Figma.** Confirmed directly with the user rather than assumed (the initial framing
proposed building BUSINESS a real topbar bell dropdown to match its Figma exactly;
the user redirected: keep BUSINESS's current implementation unchanged, put the
correction effort into REGULAR's design instead). Split into
`BusinessNotificationsPage.tsx` (unchanged, renamed) and a new
`RegularNotificationsPage.tsx`, with `NotificationsPage.tsx` becoming a thin persona
router — the same shape the Settings correction established.

**REGULAR's 6 category tabs are all real, not a reduced set.** The original Phase 5
ticket trimmed Figma's 6 tabs to 2 (All/Unread) because only 3 event types existed
and most categories would've been permanently empty. Revisited here: confirmed
directly with the user what each category should actually mean —
- **Reviews**: a place you've saved or already reviewed gets a *new* review from
  someone else. New event type, `WATCHED_PLACE_REVIEW` (distinct from `NEW_REVIEW`,
  which notifies the place's *owner* — this notifies *watchers*).
- **Likes**: someone marks your review helpful. New event type,
  `HELPFUL_VOTE_RECEIVED` — this is exactly the event Phase 5's original
  notifications spec deliberately deferred as a non-goal ("helpful votes are
  frequent/toggleable and would likely need throttling to avoid spam"). Built here
  without throttling/dedup, per explicit direction to "put all" tabs in — see the
  Backend section for the known limitation this carries forward.
- **Replies**: unchanged, `REVIEW_REPLY`.
- **System**: unchanged mapping, `BADGE_EARNED` (matches the Figma mock data's own
  choice of an Award icon for its "system" notification type).
- **Recommendations**: confirmed as a genuinely future feature ("business
  recommendations... next version") — the tab exists per the Figma taxonomy and is
  always empty right now, not a fake/interactive preview like Settings' Preferences
  section. There's nothing to label as a preview; it's just an empty category.

**Avatar-first rows fake an identity from the *place*, not a fabricated person.**
Figma's rows show a photo per notification (reviewer/business avatar) - no such
per-notification actor data exists anywhere in this schema (no photo uploads exist
at all yet, Phase 8). Confirmed directly with the user: use `UserAvatar`'s
initials-fallback rather than staying icon-only, but the only real identity
available to initial-ize is the notification's associated *place*, not a person —
so `Notification.place.label` backs the avatar (a new field resolver,
`Notification.place: Place`, mirroring `Review.place`). `BADGE_EARNED` has no
`placeId` and falls back to a plain icon circle, since it isn't about a place or
another person.

## Backend

New migration (native Postgres enum, can't just add TS enum values), one new field
resolver, two new notification-creating hooks.

1. **`backend/src/migrations/20260816120000-add-notification-types.js`**: two
   `ALTER TYPE ... ADD VALUE IF NOT EXISTS` statements (Postgres has no "add enum
   value" migration helper, and `ALTER TYPE` can't run inside the same transaction
   as other DDL — each statement runs separately). `down` is a no-op — Postgres has
   no `DROP VALUE`.
2. **`backend/src/enums/notificationTypeEnum.ts`**: `WATCHED_PLACE_REVIEW`,
   `HELPFUL_VOTE_RECEIVED` added. The Sequelize model (`models/notifications.ts`)
   derives its own enum values from `Object.values(NotificationTypeEnum)`, so no
   separate model edit was needed.
3. **`backend/src/repositories/reviewRepository.ts`**: `getReviewerIdsForPlace
   (placeId, excludeReviewerId)` — distinct past reviewer ids for a place, minus
   the reviewer who just wrote the new one.
4. **`backend/src/services/savedPlaceService.ts`**: `getSaverUserIds(placeId)` —
   every user who has this place saved, any list type.
5. **`backend/src/services/reviewService.ts`**: `createReview` gained a
   `notifyWatchers` step after the existing `NEW_REVIEW` notification — unions
   saver ids + past-reviewer ids, excludes the new reviewer and the place owner
   (already notified via `NEW_REVIEW`), fires one `WATCHED_PLACE_REVIEW`
   notification per remaining watcher. Best-effort, outside the write transaction,
   same precedent as the existing `NEW_REVIEW` hook.
6. **`backend/src/services/reviewVoteService.ts`**: `toggle` fires
   `HELPFUL_VOTE_RECEIVED` to the review's author when a vote is newly created
   (never on un-vote, never for a self-vote). **Known limitation, carried forward
   from the original deferral**: no dedup — a voter toggling off and back on
   re-fires the notification each time. Accepted per explicit direction to build
   this now rather than design throttling first.
7. **`backend/src/graphql/typeDefs/notificationTypedefs.ts`** /
   **`notificationResolver.ts`**: `Notification.place: Place`, resolved on demand
   from `placeId` (null for `BADGE_EARNED`) — same shape as `Review.place`.

## Frontend

1. **`routes/app/profile/ProfileActivityChart.tsx`** (new): gradient `AreaChart`
   replacing `ReviewVolumeChart` in `ProfilePage.tsx`. Still reuses
   `dashboard/formatMonth.ts`'s `monthLabel` (a persona-agnostic date-formatting
   utility, not a UI component, so reusing it isn't the same mistake).
2. **`lib/notificationIcons.ts`**: icons added for the two new types (`Star` for
   `WATCHED_PLACE_REVIEW`, `ThumbsUp` for `HELPFUL_VOTE_RECEIVED`).
3. **`lib/graphql/operations/notifications.graphql`**: `place { id label }` added
   to `MyNotifications`.
4. **Notifications screen split**:
   - `routes/app/notifications/BusinessNotificationsPage.tsx` — the original file,
     renamed, content unchanged.
   - `routes/app/notifications/RegularNotificationsPage.tsx` (new) — 6 category
     tabs (client-side filtering over one `myNotifications(filter: ALL)` fetch, same
     "fetch small-ish list, filter in JS" shape Saved Places established — no
     per-category query variant), per-tab unread counts, "Mark all as read".
   - `routes/app/notifications/RegularNotificationCard.tsx` (new) — avatar-first row
     (`UserAvatar` fed `place.label`, small icon badge overlaid bottom-right) or a
     plain icon circle when there's no place (`BADGE_EARNED`).
   - `routes/app/notifications/NotificationsPage.tsx` — now a thin persona router,
     same shape as Settings' `SettingsPage.tsx`. `router.tsx` and both
     `AppLayout.tsx` nav-item lists needed zero changes.

## Verification

Backend: `npm run build` (typecheck) passes clean; `npm run db:migrate` applied the
new enum-value migration successfully against the local dev database.

Frontend: `npm run build` (typecheck) passes clean in both `backend/` and
`frontend/`. Per explicit user direction, this repo's UI work does not additionally
require driving a browser to click-test — see the root `CLAUDE.md`'s verification
section.

## Non-goals (explicitly out of scope)

- A real topbar bell dropdown for `BUSINESS` notifications — explicitly declined;
  `BUSINESS` keeps its existing full-page implementation rather than being rebuilt
  against its own Figma pattern.
- Throttling/deduplication on `HELPFUL_VOTE_RECEIVED` — known limitation, carried
  forward from the original Phase 5 deferral, accepted rather than solved here.
- Any backend event backing the "Recommendations" category — a genuinely future
  phase (business recommendations), confirmed directly with the user; the tab exists
  and stays empty until then.
