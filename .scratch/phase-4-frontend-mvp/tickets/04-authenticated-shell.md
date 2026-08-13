# Authenticated shell layout

Type: prototype
Status: closed
Claimed by: current session, 2026-08-12
Blocked by: [Design tokens](01-design-tokens.md)

## Question

What should the authenticated app shell (sidebar nav + top bar) look like and behave
like, matching Figma?

Applies **identically** to REGULAR and BUSINESS users per this map's charting session
— Business Dashboard doesn't exist until Phase 6, so business owners get the same nav
as everyone else in Phase 4, not a placeholder screen.

Nav items available in Phase 4: Discover, Categories, My Reviews. Saved,
Notifications, Profile, Settings are Phase 5+ (out of scope, see MAP.md) — decide as
part of this ticket whether they're simply absent from the Phase 4 nav or present-but-
disabled with a "coming soon" treatment; the Figma design likely shows all of them
since it covers the full product, not just Phase 4's cut.

Use `/prototype` (UI branch) grounded in the Figma nodes for the sidebar/shell
(`get_design_context`, `figma-design-to-code` skill, fileKey
`uecnUKqT4CI7LuIpWo50Pp`).

## Resolution

**Verdict: Variant A** — faithful `w-60` (240px) sidebar adapted from the real
source, only the 3 Phase-4 nav items (Discover, Categories, My Reviews) exist at
all — Saved/Notifications/Profile/Settings are fully absent, not locked/disabled.
Mobile gets a hamburger + slide-over drawer (filling the gap the real source left
completely unaddressed for small screens).

Refined significantly beyond the initial build, based on live feedback:
- **Desktop collapse-to-icon-only toggle** — a circular button in the top bar
  (left of the page title, not inside the sidebar header where it felt cramped
  when collapsed) shrinks the sidebar to a 4.5rem icon-only rail. Hovering any
  icon (nav items, avatar) in that state shows its label via a small dark
  tooltip popping out to the right.
- **Smooth label transitions** — logo text, nav labels, and the user chip's
  name/role fade + shrink via `opacity`/`max-width`/`gap` transitions in sync
  with the sidebar's own width transition, replacing an initial abrupt
  `display:none` toggle that looked jarring.
- **Fixed dropdown positioning bug** — the "Log out" menu was originally
  positioned via `left-3 right-3` (relative to its parent), which squeezed it to
  near-nothing when the parent sidebar collapsed to 72px. Fixed to pop out to the
  right of the collapsed rail at a fixed width, consistent with how the tooltips
  already behave.
- A real sign-out affordance (avatar → dropdown → "Log out") ships even though
  Profile/Settings don't exist yet in Phase 4.

Prototype committed to throwaway branch `prototype/authenticated-shell` (commit
`59b721a`), out of `main` per the prototype skill's capture step.

## Comments

**Correction to ticket 01 (Design tokens), 2026-08-12**: that ticket's research
claimed "the design uses shadcn/ui's full `Sidebar` primitive set
(16rem/3rem/18rem widths) — directly reusable." Read the real `App.tsx` directly
(fileKey `uecnUKqT4CI7LuIpWo50Pp`) to ground this ticket and found that's
**incorrect** — the actual `Sidebar` component is a hand-rolled `<aside
className="w-60 ...">` (240px fixed), not the shadcn primitive (no
`SidebarProvider`/`SidebarContent` import anywhere in `App.tsx`, grepped and
confirmed absent). It also has **zero responsive/mobile handling** — no
hamburger, no `Sheet`, no breakpoint collapse logic at all. Worth knowing before
anyone reaches for the shadcn `Sidebar` primitive expecting it to match this
screen.

Real `NAV_ITEMS` (exact, 7 total): Discover, Categories, My Reviews, Saved,
Notifications, Profile, Settings. Real `TopBar`: per-screen title/subtitle pulled
from a `screenMeta` map, a notification bell with unread-count badge, an
avatar+name button. Real sidebar user chip: avatar + name + role/badge-count line
("Elite Reviewer · 127" — Phase 5 gamification language, adapted out here since
badges don't exist).

3 variants built, answering this ticket's two real open questions — absent vs.
"coming soon" treatment for the 4 out-of-scope nav items, and (since the source
left this completely unaddressed) what Phase 4's mobile nav pattern should
actually be:
- **A** — faithful w-60 sidebar, only the 3 Phase-4 items exist in the DOM at
  all (others fully absent), a hamburger + slide-over added for mobile (filling
  the gap the source left open).
- **B** — same w-60 sidebar, but all 7 real items render — the 4 out-of-scope
  ones are visibly present but locked/dimmed with a "Soon" tag (signals the full
  roadmap rather than hiding it; the top bar's notification bell gets the same
  locked treatment for consistency).
- **C** — structurally different: a collapsed icon-only rail (dark, 64px) instead
  of a labeled sidebar, top bar becomes primary with an inline search field.

All 3 also add something the ticket's Question didn't mention but Phase 4
actually needs: a real sign-out affordance (avatar → dropdown → "Log out") —
Profile/Settings aren't built yet, but a logged-in user still needs an exit door.

Prototype: `.scratch/phase-4-frontend-mvp/prototypes/authenticated-shell/index.html`
(`?variant=A/B/C`). Clicking the nav items switches the (placeholder) content
area and top-bar title/subtitle to prove the shell's behavior, not just its
static look.
