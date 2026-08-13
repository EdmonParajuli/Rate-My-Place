# Marketing landing page

Type: prototype
Status: closed
Claimed by: current session, 2026-08-12
Blocked by: [Design tokens](01-design-tokens.md)

## Question

What should the logged-out marketing/landing page look like and behave like — dark-
gradient hero with headline + search bar with quick-filter tags, animated mesh
background, stats strip (reviewer count / business count / review count /
satisfaction %), "For Reviewers" feature + business cards, recent-reviews carousel,
"For Businesses" feature + dashboard preview, testimonial carousel, CTA banner,
footer — matching the Figma design (Version 2 in the prototype file)?

Included in Phase 4 scope per this map's charting session (see MAP.md "Standing
decisions" — this was a real open question, since `04-roadmap.md`'s Phase 4 checklist
never mentions this screen even though `01-vision-and-scope.md` and
`05-frontend-plan.md`'s structure sketch both assume it exists).

Resolve as part of this ticket: does the stats strip need a real backend query (none
exists today — no platform-aggregate query in the schema), or ship as static/hardcoded
marketing copy for Phase 4? (MAP.md's "Not yet specified" flags this as unresolved,
deliberately left for here rather than pre-decided.)

Use `/prototype` (UI branch — several variations on one route) grounded in the actual
Figma nodes for this screen (`get_design_context`, `figma-design-to-code` skill,
fileKey `uecnUKqT4CI7LuIpWo50Pp`).

**Note from the Design tokens ticket**: fetching `get_design_context` with
`nodeId "0:1"` on this fileKey returned only the authenticated "core app" screens
(`Screen` type: discover/categories/category-detail/my-reviews/saved/notifications/
profile/settings) — no marketing content was in that source tree. This screen is
described in `01-vision-and-scope.md` as Figma "Version 2." Start this ticket by
figuring out where that content actually lives in the Figma Make project (a
different node, a different file/branch) before assuming the same fetch approach
works — don't reuse the design-tokens ticket's fetch as if it already covered this.

## Resolution

**Verdict: Variant B** — dark-gradient hero (using ticket 01's real extracted
gradient token: `slate-900`→`blue-950`→`slate-900` base + amber/blue radial blooms
at 20% opacity), with the stats strip (5M+ Active Users / 1.2M Businesses Listed /
10M+ Reviews Shared / 98% Satisfaction Rate — confirmed hardcoded, see Comments)
embedded directly in the hero rather than buried near the footer. Primary affordance
directly below the hero is a two-card dual-path chooser ("I'm here to review" / "I
run a business") rather than leading straight into feature copy. Below that: a
horizontal-scroll "Trending near you" business strip (not a static grid), condensed
3-icon feature strip (not the two full alternating image+copy sections Variant A
used), testimonials, a CTA banner reusing the hero gradient, shared footer.

This settles the doc-1-vs-real-source discrepancy noted below in favor of doc 1's
richer reading (dark hero, stats-led) over the plainer light-themed source found in
the actual Figma Make file — a deliberate design upgrade over the source, not a
faithful port.

Prototype committed to throwaway branch `prototype/marketing-landing-page`
(commit `1d65535`), out of `main` per the prototype skill's capture step.

## Comments

**Investigation (2026-08-12)**: located "Version 2" — it's a genuinely separate Figma
Make file, `https://www.figma.com/make/oVTXc2TbEHvaGM5mVXL6L1/Design-Rate-My-Business-UI`
(fileKey `oVTXc2TbEHvaGM5mVXL6L1`). Note: `01-vision-and-scope.md` had flagged this
exact fileKey as "an empty/unstarted Figma Make file" — that note is now **stale**;
the file has real, substantial marketing-page source. Its `App.tsx` currently
defaults to rendering `UserDashboardLayout` (a later iteration, out of this ticket's
scope), but the marketing components — `Hero.tsx`, `Navigation.tsx`, `Features.tsx`,
`FeaturedBusinesses.tsx`, `Testimonials.tsx`, `Footer.tsx` — still exist as unused
files from an earlier point in the same Make thread and were read directly.

**Resolves this ticket's own open question**: the stats strip (5M+ Active Users /
1.2M Businesses Listed / 10M+ Reviews Shared / 98% Satisfaction Rate) is confirmed
**hardcoded literal marketing copy** in the real source (embedded in `Testimonials.tsx`,
not a standalone component) — not computed from any prop or backend query. Ship it
static for Phase 4.

**Discrepancy vs. `01-vision-and-scope.md`, not silently resolved**: the real
`Hero.tsx` is light-themed (blurred color blobs on `slate-50`) — not the "dark-
gradient hero" / "animated mesh background" doc 1 describes — and there is no
recent-reviews-carousel component anywhere in this source tree. Doc 1 was likely
written from a different visual read of the Figma file than what this particular
buildable Make iteration actually contains. Built 3 variants exploring both readings
rather than picking one silently — see the prototype.

**Side finding relevant to the Auth screens ticket**: `Navigation.tsx`'s desktop nav
wires "For Users"/"For Businesses" buttons to `setView('userAuth' as any)` /
`setView('businessAuth' as any)` — references to auth views that don't exist in the
type or as built components anywhere in either Figma Make file. Confirms **no auth
screen source exists in Figma at all** (neither file has one), but also signals the
intended UX: separate entry points per user type, not one generic "Sign In" link
(the mobile nav, inconsistently, only has generic "Sign In"/"Get Started"). Left as a
note on the Auth screens ticket rather than acted on here.

Prototype: `.scratch/phase-4-frontend-mvp/prototypes/marketing-landing-page/index.html`
— 3 variants (`?variant=A/B/C`): A = source-faithful (light hero, linear scroll), B =
dark-hero/dual-path chooser (doc-1 reading, using ticket 01's real extracted
gradient), C = browse-grid-led (minimal copy, business grid above the fold).
