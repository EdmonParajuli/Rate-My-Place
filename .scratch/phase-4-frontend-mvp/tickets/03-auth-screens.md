# Auth screens (signup / login)

Type: prototype
Status: closed
Claimed by: current session, 2026-08-12
Blocked by: [Design tokens](01-design-tokens.md)

## Question

What should the signup and login screens look like and behave like, matching Figma?

Signup must surface the REGULAR/BUSINESS choice — `InputAuthSignUp.userType` already
exists on the backend (`src/graphql/typeDefs/authTypedefs.ts`) and this map's charting
session decided BUSINESS signup stays open in Phase 4 (owners get the same shell as
regular users, see the "Authenticated shell layout" ticket) rather than being gated
until Phase 6.

Forgot/reset-password UI is explicitly **out of scope** for this ticket — deferred to
Phase 7 per this map's charting session, even though the backend already supports it
end-to-end. A login screen with no working "forgot password?" link (or none at all) is
the correct Phase 4 shape; don't design that flow here.

Use `/prototype` (UI branch) grounded in the Figma nodes for these screens
(`get_design_context`, `figma-design-to-code` skill, fileKey
`uecnUKqT4CI7LuIpWo50Pp`).

**Note from the Design tokens ticket**: fetching `get_design_context` with
`nodeId "0:1"` on this fileKey returned only the authenticated "core app" screens —
no signup/login screen was in that source tree. Same caveat as the Marketing landing
page ticket: figure out where the auth screens actually live in the Figma Make
project before assuming the same fetch approach applies here.

**Update from the Marketing landing page ticket (2026-08-12)**: "Version 2" is a
separate Figma Make file, fileKey `oVTXc2TbEHvaGM5mVXL6L1`
(`https://www.figma.com/make/oVTXc2TbEHvaGM5mVXL6L1/Design-Rate-My-Business-UI`) —
**checked, and it has no auth screen either.** Its `Navigation.tsx` wires "For
Users"/"For Businesses" buttons to `setView('userAuth' as any)` /
`setView('businessAuth' as any)` — references to views that were never built (not in
the `currentView` type, no matching component file in either Figma Make file). So:
**no Figma source exists for signup/login in either file** — this ticket is a
from-scratch composition using the extracted design tokens
(`research/design-tokens.md`), not a design-to-code port. One real signal worth
keeping though: the dead `userAuth`/`businessAuth` reference implies the intended UX
was separate entry points per user type (not one generic "Sign In" link) — worth
weighing against this map's own decision that signup surfaces a REGULAR/BUSINESS
choice inline (see Question above) rather than routing to two different entry
points; these aren't necessarily in conflict (an inline toggle *is* a way of
surfacing the two paths) but it's worth being deliberate about which UX this ticket
lands on rather than defaulting to one without noticing the design signal existed.

## Resolution

**Verdict: Variant A** — split-screen, dark hero-gradient left panel (continuity
with the marketing page's chosen Variant B) with a rotating testimonial carousel
(3 reviews, 5s auto-advance + manual next arrow, avatars), Sign In/Sign Up tabs on
the right, REGULAR/BUSINESS as two selectable icon cards inside the signup form.

Also decided as part of this ticket: business-owner signup expands into a
short two-step wizard (account fields → place details) rather than ending at just
the account, backed by a new atomic `signUpBusiness` mutation — see Comments below
for the full reasoning and the roadmap/architecture/frontend-plan doc updates this
produced. Not built into the prototype itself (documentation-only decision, per
instruction).

Prototype committed to throwaway branch `prototype/auth-screens` (commit
`519cb0e`), out of `main` per the prototype skill's capture step.

## Comments

**Build (2026-08-12)**: no Figma source exists for these screens (confirmed on the
Marketing landing page ticket — checked both Figma Make files). Built as a
from-scratch composition grounded in the extracted design tokens
(`research/design-tokens.md`), not a design-to-code port. Fields match the real
backend contract exactly (`src/graphql/typeDefs/authTypedefs.ts`):
`InputAuthSignUp { name, email, password, userType }`, `InputAuthLogin { email,
password }`. "Confirm password" is a client-side-only UX convention in all 3
variants — not part of `InputAuthSignUp`, never sent to the mutation, purely for
client-side match validation. No forgot-password link anywhere, per this ticket's
own out-of-scope note.

3 variants built exploring the open question from the Question section — inline
REGULAR/BUSINESS toggle (this map's charting decision) vs. a separate first step
(the dead `userAuth`/`businessAuth` signal):
- **A** — split-screen, dark hero-gradient left panel (continuity with the
  Marketing landing page's chosen Variant B), Sign In/Sign Up tabs in a card on the
  right, REGULAR/BUSINESS as a segmented control inside the signup form (inline
  toggle reading).
- **B** — two-step: a full-bleed "How will you use Rate My Place?" chooser is the
  *first* screen, landing on a type-aware form after (closest to the dead
  `userAuth`/`businessAuth` signal — separate entry points, not an inline toggle).
- **C** — minimal centered single card, no imagery, icon-button type picker,
  password-visibility toggle — plain utilitarian structure, no split-screen or
  multi-step flow at all.

Prototype: `.scratch/phase-4-frontend-mvp/prototypes/auth-screens/index.html`
(`?variant=A/B/C`).

**Verdict on the visual direction: Variant A** — split-screen, dark hero-gradient
left panel with a rotating testimonial carousel (3 reviews, 5s auto-advance +
manual next arrow, avatars), Sign In/Sign Up tabs on the right, REGULAR/BUSINESS
as two selectable icon cards inside the signup form (not a flat pill toggle).

**New decision (2026-08-12), resolves the inline-toggle-vs-separate-signal question
above**: business-owner signup will **not** stop at just creating a User —
immediately after choosing "Business owner," the signup flow continues into
collecting the place's own details (name, category, address, phone, website, price
range) as a second step of the *same* signup flow, submitted together. This settles
the open tension noted above in favor of a **hybrid**: REGULAR/BUSINESS stays an
inline choice inside signup (per this map's charting decision), but choosing
BUSINESS expands signup into a short wizard rather than ending at just the account
fields — closer in spirit to the dead `userAuth`/`businessAuth` signal (a
meaningfully different path per user type) without literally forking into two
separate entry screens.

**Backend implication — new scope, not previously in this map**: this requires a
new `signUpBusiness` mutation that creates the `User` and `Place` **atomically in
one transaction** (chosen over chaining the existing `signUp` + `createPlace`
calls, which would risk a `BUSINESS`-type user left with no place if they drop off
between steps). Recorded as a task in
[04-roadmap.md](../../../docs/04-roadmap.md) Phase 4 and detailed in
[03-architecture.md](../../../docs/03-architecture.md) (backend shape) and
[05-frontend-plan.md](../../../docs/05-frontend-plan.md) (frontend wizard
behavior) — not implemented in the prototype itself, per instruction.
