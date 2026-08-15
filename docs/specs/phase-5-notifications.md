# Phase 5 Spec: Notifications

**Status: ✅ Built.** Third ticket of Phase 5 — Personalization, after Saved Places
and Badges. See [03-architecture.md](../03-architecture.md)'s "Built: Notifications"
section for the condensed version.

## Context

Per `docs/04-roadmap.md`: **"`NOTIFICATIONS` table + resolver + Notifications
screen; decide the triggering events (new reply to your review, business responds,
etc.)"** — the triggering events were deliberately left open, unlike Saved Places and
Badges' scope which was fully specced up front. Per
[01-vision-and-scope.md](../01-vision-and-scope.md) item 5, Notifications is its own
top-level screen with 6 filter tabs and unread badges in the Figma source.

## Two decisions

**3 triggering events**, confirmed directly with the user (asked because the roadmap
left this genuinely open, not because there was one obviously correct answer):

| type | fires when | notifies |
|---|---|---|
| `REVIEW_REPLY` | a business owner replies to a review | the review's reviewer (REGULAR) |
| `NEW_REVIEW` | someone reviews a place | that place's owner (BUSINESS) |
| `BADGE_EARNED` | a badge newly flips to earned | the reviewer (REGULAR) — ties into [phase-5-badges.md](./phase-5-badges.md) |

Each reuses a write path that already existed — no new triggers to build — and
together they cover both user types, which matters since Notifications (unlike
Badges' interim My Reviews placement) is its own screen with its own nav item for
both personas.

**6 Figma tabs → 2 (All/Unread)** — with only 3 real event types, most of the
original 6 would be permanently-empty categories. Same "start smaller than the full
design" discipline Badges applied to its 5-badge grid vs. the full achievement grid.

## Design

**Notifications are event records, not check-on-read.** This is the opposite of
Badges' design and deliberately so: a badge is a *threshold* (evaluate current stats
whenever asked), a notification is an *event* (something happened at a specific
moment, and the record needs to exist right away — there's no "current state" to
recompute later). `NotificationService.create(...)` is called from inside the 3
existing write paths, immediately after each one's primary write succeeds:

- `ReviewService.createReview` — after the transaction commits (best-effort, not core
  write correctness, so deliberately outside the transaction that writes the review
  and recomputes place stats).
- `ReviewReplyService.createReply` — `assertPlaceOwnership` (which already fetches
  both the review and the place to check ownership) was changed to return
  `{review, place}` instead of nothing, so the notification hook needs zero extra
  queries.
- `BadgeService.getForUser` — inside the loop that inserts newly-earned `UserBadge`
  rows, one notification per newly-earned badge.

This is the same "a service depends on another service for a side effect" shape
`ReviewVoteService` already uses on `ReviewService` (to keep `Review.helpfulCount` in
sync) — resolvers stay thin and unchanged; the notification is an internal
implementation detail of the service that owns the primary write.

**`message` is precomputed human-readable text at creation time** (e.g. "The Daily
Grind replied to your review"), not a generic `type`+`payload` blob. Simpler for the
frontend (no per-type interpretation logic) and avoids an N+1 lookup to resolve a
place label per notification row at render time. `type` is still a real column, used
for icon selection.

**Read/unread is a real SQL `where` filter**, not the "fetch all, filter in JS"
precedent Saved Places used for its ALL/WANT_TO_VISIT/FAVORITE tabs. That precedent
fit a small, capped list reused across 3 tabs off one column; a notification feed is
unbounded and grows over time, so filtering at the query level is the correct default
here — a deliberate, reasoned departure, not an inconsistency.

**No real-time push.** `unreadNotificationCount` backs a nav-badge pill that polls
every 30s (`pollInterval`) — no websockets/subscriptions exist in this codebase, same
"start simple" call made everywhere else. The 3 mutating operations
(`markNotificationRead`/`markAllNotificationsRead`/`deleteNotification`) additionally
pass `refetchQueries: ["UnreadNotificationCount"]` so the pill reflects the user's own
action immediately rather than waiting for the next poll tick — a gap found during
click-through verification (the pill stayed stale for up to 30s after the user's own
click) and fixed as part of this same ticket, not filed as follow-up debt.

## Backend

New vertical slice, `providers_notifications(id, user_id FK, type ENUM(REVIEW_REPLY |
NEW_REVIEW | BADGE_EARNED), message TEXT NOT NULL, place_id FK nullable, read
BOOLEAN NOT NULL DEFAULT false, created_at, updated_at, deleted_at)` —
`paranoid: true` (the base project convention, not the toggle-table exception
`ReviewVote`/`SavedPlace`/`UserBadge` use — deleting a notification is a normal,
reversible content delete). Index on `(user_id, read)`.

1. `backend/src/enums/notificationTypeEnum.ts`, migration
   `20260815190000-create-notifications-table.js`.
2. `notificationInterface.ts`/`notifications.ts` (model) — mirrors `categories.ts`'s
   `paranoid: true` shape.
3. `notificationRepository.ts` — `countUnread(userId)` (mirrors
   `ReviewVoteRepository.countForReview`'s single-purpose count shape) and
   `markAllReadForUser(userId)` (a bulk `where`-scoped update `BaseRepository
   .updateOne` can't express, since that method only targets a single `id`).
4. `notificationService.ts` — `create`, `getForUser(userId, filter)`,
   `getUnreadCount`, `markAsRead`/`markAllAsRead`/`deleteNotification` (the latter two
   use `assertOwnership` before acting, same pattern every other owned-resource
   mutation in this codebase follows).
5. Hooks into `reviewService.ts`, `reviewReplyService.ts`, `badgeService.ts` as
   described above.
6. `notificationTypedefs.ts` / `notificationResolver.ts` — `myNotifications(filter)`,
   `unreadNotificationCount`, `markNotificationRead`/`markAllNotificationsRead`/
   `deleteNotification` (the latter three reuse the existing `Message` type from
   `authTypedefs.ts` rather than inventing new response types). `requireAuth`
   throughout, no args beyond `filter` — same no-IDOR-surface choice every other
   `my*`-prefixed query already makes.
7. Wired into the usual `typeDefs`/`resolvers`/`schema` barrel exports.

## Frontend

1. `notifications.graphql` — `MyNotifications(filter)`, `UnreadNotificationCount`,
   `MarkNotificationRead`, `MarkAllNotificationsRead`, `DeleteNotification`.
2. `lib/notificationIcons.ts` — a plain `Record<NotificationTypeEnum, LucideIcon>`
   (not a seed-string lookup like `categoryIcons.ts`/`badgeIcons.ts`, since the type
   enum is fixed code, not data — no fallback-icon case needed for a value the union
   can't produce).
3. `routes/app/notifications/NotificationCard.tsx` — icon + message + relative date
   (`formatDate.ts`) + unread accent (background tint + dot) + hover-reveal delete.
   Clicking marks read and navigates to `/app/places/{placeId}` if set, or
   `/app/my-reviews` for `BADGE_EARNED` (the only place badges are visible), or does
   nothing further otherwise.
4. `routes/app/notifications/NotificationsPage.tsx` — 2 tabs (All/Unread), "Mark all
   as read", empty state per tab.
5. `routes/router.tsx` — `{ path: "notifications", element: <NotificationsPage /> }`.
6. `routes/app/AppLayout.tsx` — `Bell` nav item added to **both**
   `REVIEWER_NAV_ITEMS` and `BUSINESS_NAV_ITEMS` (the first nav item in this app that
   isn't persona-specific), an unread-count pill rendered on that nav item sourced
   from a single `useUnreadNotificationCountQuery({ pollInterval: 30000 })` call in
   `AppLayout` itself (not per-nav-item), `SCREEN_META` entry. Not added to
   `REVIEWER_ONLY_PATH_PREFIXES` since business accounts need it too.

## Verification

Backend, exercised live via GraphQL with a business owner + reviewer account pair:
reviewer reviewed the owner's place → `unreadNotificationCount` for the owner
incremented and `myNotifications` showed a `NEW_REVIEW` entry; owner replied → the
reviewer got a `REVIEW_REPLY` notification; the same review being the reviewer's
first ever also produced a `BADGE_EARNED` (`FIRST_REVIEW`) notification (confirmed in
a separate request from the one that triggered `myBadges`, since concurrent root
Query field resolution meant reading the count in the *same* request as the
badge-awarding read raced it). Confirmed `UNREAD` vs `ALL` filtering, `markAllAsRead`
zeroing the count, delete removing a row from both filters, and that acting on
another user's notification throws `FORBIDDEN`.

Frontend, click-tested in-browser as both personas: nav pill showed the correct
unread count on first load for a business owner with one unread `NEW_REVIEW`;
clicking the card navigated to the place and cleared the pill immediately; a reviewer
account's nav also showed Notifications with a `REVIEW_REPLY` card; "Mark all as
read" cleared the pill and card highlighting; the Unread tab's empty state rendered
correctly once nothing was left unread.

## Non-goals (explicitly out of scope)

- Real-time push (websockets/subscriptions) — polling only, see Design above.
- Any triggering event beyond the 3 shipped (e.g. "someone helpful-voted your
  review") — deliberately left for a later pass if it turns out to matter; helpful
  votes are frequent/toggleable and would likely need throttling to avoid spam,
  unlike the 3 shipped events which are each naturally rare per user.
- Push/email notifications — in-app only.
