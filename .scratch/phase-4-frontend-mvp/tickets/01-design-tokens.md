# Design tokens

Type: research
Status: closed
Claimed by: wayfinder research fork, 2026-08-11
Blocked by: (none)

## Question

Extract the real design tokens from the Figma Make prototype — colors (including the
dark-gradient hero's exact stops), spacing scale, border radii, font stack/weights,
and the recurring component styles (rounded card, badge, toggle switch, sidebar nav)
— for use as the single Tailwind config / `tokens.css` source of truth across every
Phase 4 screen.

Source: `https://www.figma.com/make/uecnUKqT4CI7LuIpWo50Pp/Rate-My-Business-UI-UX-Design`,
fileKey `uecnUKqT4CI7LuIpWo50Pp`. Use `get_design_context` with `nodeId "0:1"` (Figma
Make files always use that node id; `get_metadata`/`get_screenshot` aren't supported
for `/make/` URLs). Load the `figma-design-to-code` skill first.

Prefer real extracted values (hex codes, rem/px, the file's own generated Tailwind
config or CSS variables if Figma Make exposes one) over eyeballing screenshots — see
[05-frontend-plan.md](../../../docs/05-frontend-plan.md)'s "Design tokens" section for
why. Write the findings to a markdown file citing where each value came from.

## Resolution

Full findings: [research/design-tokens.md](../research/design-tokens.md). The
`get_design_context` fetch returned the Figma Make file's actual generated source
(Vite + React + Tailwind v4 + shadcn/ui), not just a screenshot, so most values below
are exact/cited rather than eyeballed.

- **Stack cross-validation**: the source itself uses react-router, react-hook-form,
  recharts, and Tailwind v4 — matching `05-frontend-plan.md`'s picks independently.
  Also uses lucide-react (icons, no prior doc-5 decision) and embla-carousel-react
  (carousels).
- **Colors**: default shadcn/ui theme — primary `#2563EB` (blue), accent `#F59E0B`
  (amber), destructive `#EF4444`, full light/dark CSS variable set captured. The
  "dark-gradient" look is a one-off hero treatment
  (`bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900` + two radial accent
  blooms), not a global dark theme.
- **10 category accent colors** extracted exactly (gradient/bg/icon-color per
  category) — matches doc 1's 10-category claim, directly usable as seed data.
- **Typography**: Plus Jakarta Sans (400-800) + Manrope (400-700); Manrope confirmed
  as the body font, Plus Jakarta Sans's role inferred not confirmed.
- **Radius**: `--radius: 0.75rem` base, sm/md/lg/xl derived — but hand-built cards
  lean on literal `rounded-2xl` more than the semantic scale.
- **Sidebar**: the design uses shadcn/ui's full `Sidebar` primitive (16rem
  expanded / 3rem icon-collapsed / 18rem mobile sheet) — directly reusable, not a
  custom component to design from scratch.
- **Caveat for later tickets**: this fetch's source only covers the authenticated
  "core app" screens (discover/categories/category-detail/my-reviews/saved/
  notifications/profile/settings) — no marketing, auth, or place-detail screen was
  in this source tree. The Marketing landing page and Auth screens tickets will need
  their own investigation into where that content lives in the Figma Make project.

## Comments

No dedicated `research/design-tokens` git branch was created (the wayfinder skill's
usual convention for research tickets) — the repo's working tree already has
substantial uncommitted, unrelated work in progress on the checked-out branch
`rmp-12-ticket-08-rate-limiting`, and creating/switching branches in a shared working
directory risked disrupting that. Findings live as a plain file instead, to be
committed whenever the rest of this map's output is committed.

**Prototype validation (2026-08-12)**: per `/prototype`, built a single reference/
validation page (not a 3-variant structural comparison — this ticket's findings are
extracted facts, not an open layout decision) assembling the extracted tokens into
near-real components, to sanity-check them before they land in the real `frontend/`
tokens.css. Verdict: **keep as-is**, including the default heading/body font pairing
(Manrope = body, Plus Jakarta Sans = heading) — the one sub-question the research
flagged as unconfirmed. Captured on throwaway branch `prototype/design-tokens-
reference` (commit `fac9edb`), out of `main` per the prototype skill's capture step —
not merged, not left on the working branch.
