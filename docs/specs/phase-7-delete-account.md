# Phase 7 Spec: Delete-Account Flow (typed confirmation + policy decision)

**Status: ✅ Frontend flow built (still a preview), ✅ retention/anonymization
policy decided and documented, ❌ no `deleteUser` mutation.** Last of Phase 7's
sequenced tickets.

## Context

`docs/04-roadmap.md`'s Phase 7 listed this one differently from the other preview
sections: it explicitly called for deciding the retention/anonymization policy now,
since it constrains the eventual `deleteUser` mutation's design, even though no
backend work ships in this ticket. The pre-existing Danger Zone card (from the
Security/active-sessions ticket) was just a permanently-disabled button with a
caption — no typed-confirmation interaction at all, unlike the Figma source
(`uecnUKqT4CI7LuIpWo50Pp`'s `SettingsScreen()`), which has a `showDeleteConfirm`
toggle revealing a "Type DELETE to confirm" input plus Cancel/Delete buttons.

## Decisions

Both confirmed directly with the user (2026-08-16):

**Reviews: anonymize, don't remove.** On deletion, a user's existing reviews stay
visible with their ratings intact — the author is replaced with a generic "Deleted
User" placeholder rather than the review disappearing. Preserves rating history for
the places reviewed (a place's `averageRating`/`reviewCount` shouldn't visibly shift
just because a reviewer later deleted their account) and matches how most review
platforms (Yelp, Google) handle this, over the alternative of hard-removing the
reviews (technically trivial given `Place.averageRating`/`reviewCount` are already
recomputed from source rather than incrementally adjusted, but erases real feedback
history).

**User row: anonymize in place, don't hard-delete.** The row survives with
`deletedAt` set (the same `paranoid: true` soft-delete convention already used on
every table in this codebase — see the root `CLAUDE.md`'s data-model conventions);
`email`/`fullName` get overwritten to placeholder values instead of the row being
removed. Chosen over a hard delete specifically because a hard delete would require
deciding cascade/nullify behavior for every FK pointing at `User.id` (`reviews.reviewerId`,
`user_badges`, `saved_places`, `providers_sessions`) — a materially bigger, riskier
change than reusing the pattern already proven everywhere else in this schema.

**Neither decision is implemented yet.** No migration, no service method, no
`deleteUser` mutation exists — this ticket only decided and documented the shape so
a future ticket can build it without re-litigating the design. Same pattern as the
Privacy ticket's scope questions, except here the user chose to decide rather than
defer.

**The typed-confirmation gate is real frontend logic; the deletion itself stays a
no-op.** The Figma mock's confirm button isn't actually gated on the input's
contents (it's a static mockup). Since the roadmap explicitly asked for "typed
confirmation," the Delete Account button is genuinely disabled until the input's
value is the exact string `"DELETE"` — real, testable validation, not decoration.
What happens after a valid click is still fake, because there's genuinely nothing to
call: clicking shows an inline "Preview feature — account deletion isn't implemented
yet. Nothing was deleted." message and performs no mutation. This is the same
split this session has used throughout Phase 6/7's preview sections — build the real
parts for real, label the parts that have no backend yet, rather than faking the
whole interaction or leaving it a dead button.

## Frontend

`routes/app/settings/RegularSettingsPage.tsx`'s `DangerZoneSection`:
- New local state: `showDeleteConfirm`, `confirmText`, `deleteAttempted`.
- "Delete My Account" button reveals the confirm block (input + Cancel/Delete Account
  buttons), matching the Figma source's layout.
- Delete Account button is `disabled={confirmText !== "DELETE"}` — real gating.
- Clicking it while enabled sets `deleteAttempted`, rendering the preview-notice
  caption in place of performing any action. Editing the input after a failed/valid
  attempt clears `deleteAttempted` so the message doesn't linger stale.
- Cancel resets all three pieces of state back to the closed state.

## Verification

`npm run build` (typecheck) passes clean in `frontend/`. Per explicit user
direction, this repo's UI work does not additionally require driving a browser to
click-test — see the root `CLAUDE.md`'s verification section.

## Non-goals (explicitly out of scope)

- The `deleteUser` mutation, migration, or any service/repository code implementing
  the anonymization decisions above — policy only, no backend build.
- Actually performing account deletion or logging the user out on a "successful"
  (preview) click.
- Re-authentication before deletion (e.g. re-entering password) — not in the Figma
  source, not asked for; worth revisiting once the real mutation is built.
