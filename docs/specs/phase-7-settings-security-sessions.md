# Phase 7 Spec: Settings Correction + Security (Active Sessions)

**Status: ✅ Built.** Second of Phase 7's sequenced tickets. Two things landed
together because the second couldn't be built correctly without first fixing the
first: (1) splitting the wrongly-shared Settings screen back into two persona-correct
screens (see the Correction section atop
[specs/phase-7-settings-account-edit.md](./phase-7-settings-account-edit.md)), and
(2) the `REGULAR` Settings screen's Security section — active sessions list + revoke.

## Context

`docs/04-roadmap.md`'s Phase 7 lists **"Security: 2FA, active sessions list + revoke
(built on the Phase 1 `SESSIONS` table)"** as the cheapest remaining ticket — the
backend (`activeSessions` query, `revokeSession` mutation, `SessionService`) has
existed since Phase 1 with zero UI ever built on top of it. Starting this ticket
surfaced the wrong assumption from the previous one: `SettingsPage.tsx` had been made
"generic" across both account types, but the `REGULAR` persona's actual Figma source
turned out to have a completely different Settings design (see the Correction section
linked above for the full account). Both problems got fixed in this same pass.

## Decisions

**Thread `sessionId` through login/signup/refresh so the UI can identify "this
device."** `activeSessions` returns each session's `id`/`deviceLabel`/`ipAddress`/
dates, but nothing on the login/refresh response let the frontend know which row is
the browser's own live session — revoking your own session would silently log you
out with no way to tell it apart from any other device first. Confirmed directly
with the user (three options were on the table: thread `sessionId` through properly;
skip identification but warn on every revoke click; skip both). Chosen: thread it
through. Touches every code path that creates a session
(`AuthService.login`/`signUp`, `BusinessOnboardingService.signUpBusiness`,
`SessionService.renew`) and the shared `LoginToken` GraphQL type, but each touch
point is a one-line addition (capture what `SessionService.createSession` already
returns instead of discarding it) — small, not risky.

**"Sign out of all other devices" is real; "Delete Account" is a labeled preview.**
The Figma source's Danger Zone has both. Signing out other devices needed zero new
backend — the Security section already has the full session list and a working
`revokeSession` mutation, so "sign out others" is just calling it once per
non-current session. Delete Account has no backend concept at all (no `deleteUser`
mutation, no retention/anonymization policy decided) — Phase 7's own roadmap lists
it as a separate, later item, so it renders as a disabled button with an explicit
"Preview feature" caption rather than a working-looking control on a destructive
action. This is a deliberately different call than the Preferences/Notifications/
Privacy previews below, which stay interactive (toggling a fake preference has no
real consequence; a destructive-looking button that silently does nothing does).

**Everything else on the `REGULAR` Settings shell ships as a labeled preview in the
same pass**, rather than leaving the sidebar showing only 2 of 6 sections for several
more tickets — confirmed directly with the user, same "build the whole Figma shell,
label what isn't real yet" precedent Phase 6's business console established
(Promotions, keyword-mentions, competitor-benchmark all shipped this way). Preview
sections: Preferences (dark mode - needs a real frontend theme first, not a toggle
that does nothing; language/timezone), Notifications (email/push toggles - real
in-app notifications already exist from Phase 5, these are a different, unbuilt
email/push concept), Privacy (blocked users, data export), Security's
Two-Factor-Authentication toggle.

## Backend

One additive field threaded through four existing code paths — no migration, no new
table, no new resolver (`activeSessions`/`revokeSession` already existed).

1. **`backend/src/graphql/typeDefs/authTypedefs.ts`**: `LoginToken.sessionId: Int`
   added.
2. **`backend/src/interfaces/authInterface.ts`**: `AuthResponseInterface` and
   `SignUpBusinessResponseInterface`'s `token` shape gained `sessionId: string`
   (matches `SessionInterface.id`'s actual type).
3. **`backend/src/services/authService.ts`** (`signUp`, `login`) and
   **`backend/src/services/businessOnboardingService.ts`** (`signUpBusiness`): each
   already called `sessionService.createSession(...)` and discarded the return value
   — now captured (`const session = await ...`) and `session.id` included in the
   returned `token`.
4. **`backend/src/services/sessionService.ts`**: `renew()` (backs
   `refreshAccessToken`, called on every page-reload session restore) captures its
   own `createSession` call's result the same way and returns `sessionId` alongside
   `accessToken`/`refreshToken`.
5. **`backend/src/graphql/resolvers/sessionResolver.ts`**: `refreshAccessToken`
   passes the new `sessionId` through to its response `data`.

## Frontend

1. **`lib/auth/tokenStorage.ts`**: `getStoredSessionId`/`setStoredSessionId`/
   `clearStoredSessionId` — same `localStorage` lifecycle as the refresh token
   (`rmp_session_id` key), set on login/signup/refresh, cleared on logout.
2. **`lib/graphql/operations/auth.graphql`** / **`session.graphql`**: `sessionId`
   added to every `token { }` selection; new `ActiveSessions` query and
   `RevokeSession` mutation.
3. **`lib/auth/AuthContext.tsx`**: `applySession`/`clearSession`/the mount-effect
   refresh path all persist or clear the session id alongside the refresh token.
4. **Settings screen split** (the correction — full detail in
   [specs/phase-7-settings-account-edit.md](./phase-7-settings-account-edit.md)):
   - `routes/app/settings/BusinessSettingsPage.tsx` — the original shared file,
     reverted to business-only (hardcoded `"Business owner"` label again). Its real
     name-edit + password-change work from the previous ticket is unchanged.
   - `routes/app/settings/RegularSettingsPage.tsx` (new) — the 6-section sidebar
     shell. `AccountSection` reuses the same real `updateUser`/`changePassword`
     pattern as the business screen (different field set: no Username/Phone, neither
     exist on `User`/were ever collected). `SecuritySection` renders
     `useActiveSessionsQuery()`'s rows, comparing each `Session.id` against
     `getStoredSessionId()` to render a "This device" badge instead of a Revoke
     button. `DangerZoneSection` receives the same session list (queried once at the
     top of `RegularSettingsPage`, passed down — not re-queried per section) to power
     "sign out of all other devices."
   - `routes/app/settings/SettingsPage.tsx` — now a thin persona router
     (`user.userType === "BUSINESS" ? <BusinessSettingsPage/> : <RegularSettingsPage/>`),
     so `router.tsx` and both `AppLayout.tsx` nav-item lists need zero changes —
     both personas' `/app/settings` nav item and the route itself already pointed
     here.

## Verification

Backend: `npm run build` (typecheck) passes clean; `sessionId` threading is a
same-shape addition to four call sites that already worked (each just stopped
discarding a value it already had).

Frontend: `npm run build` (typecheck) passes clean in both `backend/` and
`frontend/`. Per explicit user direction, this repo's UI work does not additionally
require driving a browser to click-test — see the root `CLAUDE.md`'s verification
section.

## Non-goals (explicitly out of scope)

- 2FA — Security section's toggle is a labeled preview; no backend concept exists.
- Delete Account — labeled preview, disabled control; no `deleteUser` mutation or
  retention policy exists yet (separate, later Phase 7 item).
- Real dark mode, language/timezone, email/push notification delivery, blocked
  users, data export — all labeled previews on the new `REGULAR` shell; each was
  already a distinct, undecided Phase 7 sub-area before this ticket and stays that
  way.
