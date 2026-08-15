# Phase 7 Spec: Settings + Account Edit

**Status: ✅ Built.** First of Phase 7 — Settings & account lifecycle's sequenced
tickets, following Phase 5's "build one at a time" precedent rather than planning
the whole phase up front. See [03-architecture.md](../03-architecture.md)'s "Built:
Settings + account edit" section for the condensed version.

## Context

Per `04-roadmap.md`, Phase 7 opens with: **"Account fields edit, preferences...
no `updateUser` mutation exists (name/email are still un-editable for either
account type), and this phase is account-type-agnostic (a `REGULAR` account has no
Settings screen at all yet)."** Phase 6's business-console Settings page already
shipped a read-only Account tab + real password-change flow for `BUSINESS` accounts
specifically because no `updateUser` mutation existed at the time
([specs/phase-6-business-console.md](./phase-6-business-console.md)). This ticket
is what closes that gap — for both account types at once, not just `BUSINESS`.

Phase 7 has five sub-areas (account edit, preferences, notification toggles,
privacy, security/2FA/delete-account) with real open product decisions in most of
them. Rather than plan/build all five together, they're being sequenced as separate
tickets; this is the first.

## Decisions

**`fullName` only — email stays un-editable.** Confirmed directly with the user
before implementation, because the tradeoff wasn't obvious: email is the login
identifier (`AuthService.login`, `forgotPassword`) and this codebase has no
email-verification flow anywhere — a user could type any string into the field
and immediately start logging in with it, with no confirmation step. Two safer
alternatives were on the table (require the current password to confirm an email
change; or a lightweight edit with no extra safeguard) — the chosen option defers
email editing entirely rather than build either safeguard now, revisiting later
possibly alongside the Security ticket where a real verification flow would make
more sense to build anyway.

**`User.phoneNumber` was deliberately left out of the edit form.** It exists on the
model/interface/DTO/GraphQL type but is collected nowhere at signup and displayed
nowhere in the product — confirmed directly with the user rather than silently
included or silently dropped. Adding an edit field for a value nothing else in the
app reads back would be dead-end UI; left for whenever `phoneNumber` gets an actual
purpose.

**Reuse the existing Settings screen — don't build a second one.** Phase 6's
`SettingsPage.tsx` (Account tab: profile display + real password change;
Notifications tab: explicit static preview) was `BUSINESS`-console-scoped only
because `REGULAR` had no Settings screen and Notifications toggles didn't exist yet
when it was built. Nothing about that screen is actually business-specific once its
one hardcoded `"Business owner"` label becomes dynamic — so this ticket makes it the
shared screen for both account types rather than duplicating it for `REGULAR`. Its
Notifications tab is untouched (still a labeled preview) — real per-type toggles
are a separate, later Phase 7 ticket, deliberately out of scope here.

## Backend

One new mutation, no migration, no new table — `User` already has a `fullName`
column and `updateOne` machinery via `BaseRepository`.

1. **`backend/src/validators/authValidators.ts`**: `updateUserSchema` — `fullName`
   only, identical Joi rules to `signUpSchema`'s `name` field (2-25 chars,
   letters/spaces pattern), just under the field name the `User` type/DB column
   actually use.
2. **`backend/src/services/userService.ts`**: `updateUser(id, fullName)` —
   `BaseRepository.updateOne` returns an affected-row count (`Promise<[number]>`),
   not the updated row, so this re-fetches via `findByPk` afterward, same
   update-then-re-fetch shape `ReviewService.updateReview` already uses.
3. **`backend/src/graphql/typeDefs/authTypedefs.ts`**: `InputUpdateUser { fullName:
   String! }`, `UpdateUserResponse { message, data: User }`, `updateUser` added to
   `extend type Mutation`.
4. **`backend/src/graphql/resolvers/authResolver.ts`**: `updateUser` — `requireAuth`
   (self-service, no ownership check needed beyond "is logged in"), `Validator.check`,
   delegates to `UserService.updateUser`, wraps in `SuccessResponse.send`. Same
   try/catch → `GraphQLError` translation every resolver in this codebase follows.

## Frontend

1. **`lib/graphql/operations/auth.graphql`**: `UpdateUser` mutation added, fetching
   the same `User` fields `AuthMeUser` does (including the Profile ticket's
   `createdAt`) so a post-edit refetch has everything the rest of the app expects.
2. **`lib/userTypeLabel.ts`** (new): `userTypeLabel(userType)` — extracted from
   `AppLayout.tsx`'s inline function of the same name once `SettingsPage.tsx` needed
   the identical logic, rather than duplicating it a second time. `AppLayout.tsx`
   now imports it too.
3. **`lib/auth/AuthContext.tsx`**: new `refreshUser()` on the context value —
   re-invokes the same `authMeUser` lazy query the mount-time token-refresh path
   already uses and replaces `user` state. Needed because `AppLayout`'s
   sidebar/topbar name reads from this context, not Apollo's cache; without it, a
   successful name edit wouldn't visibly update anything until the next reload.
4. **`routes/app/settings/SettingsPage.tsx`**: `AccountTab`'s previously read-only
   Full Name `<p>` became a controlled `<input>` + "Save Name" button (disabled
   until changed and non-empty, same disabled-state pattern the password form
   already uses), calling `updateUser` then `refreshUser()`. The previously
   hardcoded `"Business owner"` Account Type row now calls `userTypeLabel(user
   ?.userType)`. Email row and its disclaimer text stayed read-only, copy updated to
   reflect only email being unavailable (name no longer is).
5. **`routes/app/AppLayout.tsx`**: `Settings` nav item added to
   `REVIEWER_NAV_ITEMS` (icon already imported for `BUSINESS_NAV_ITEMS`); the
   `/app/settings` route itself already existed from Phase 6, so no router change was
   needed. Not added to `REVIEWER_ONLY_PATH_PREFIXES` — unlike Profile, Settings is
   genuinely shared, so a `BUSINESS` account reaching it should stay, not bounce.
   Local `userTypeLabel` function removed in favor of the shared helper.

## Verification

Backend: `npm run build` (typecheck) passes clean; `updateUser` follows the same
`requireAuth` + `Validator.check` + service + `SuccessResponse` shape every other
mutation in this codebase already uses and re-fetches through the same
`UserRepository.findByPk` path `authMeUser` already proved works.

Frontend: `npm run build` (typecheck) passes clean in both `backend/` and
`frontend/`. Per explicit user direction, this repo's UI work does not additionally
require driving a browser to click-test — see the root `CLAUDE.md`'s verification
section.

## Non-goals (explicitly out of scope)

- Email editing, in any form (with or without a confirmation safeguard) — deferred
  pending a real email-verification flow, see Decisions above.
- `phoneNumber` editing — no product usage exists for the field yet.
- Real notification-preference toggles — the existing static preview on the
  Notifications tab is untouched; a separate later Phase 7 ticket.
- Preferences (dark mode, language/timezone), privacy (blocked users, data export),
  security (2FA, active sessions UI), delete-account — the rest of Phase 7,
  sequenced as later tickets.
