# Phase 6 — Business Dashboard: Figma AI Prompt

Not a spec — prep material. [04-roadmap.md](../04-roadmap.md) Phase 6 hasn't started
(it's after Phase 4/5 in the current plan), and its own line item flags the reputation
score formula as an unresolved product decision. Rather than jump straight to our own
`/prototype` pass the way Phase 4's screens were built, the ask here is to get a fresh
Figma AI (Figma Make / First Draft) design first — the same way the *existing* design
reference (the two Figma Make files every Phase 4 ticket has been grounding against)
was itself AI-generated from a prompt. This gives something concrete to react to and
ground the eventual real Phase 6 ticket work against, instead of designing blind.

**How to use this**: copy the prompt in the fenced block below as-is into Figma Make
(or whichever Figma AI surface you're using) and see what it produces. Everything
above and below the block is context for *why* it's written this way, not part of the
prompt itself.

## Where this prompt's constraints come from

- **Visual language**: [research/design-tokens.md](../../.scratch/phase-4-frontend-mvp/research/design-tokens.md)
  — the real extracted colors, fonts, radius scale, and shadow usage from the existing
  Figma Make source, already validated and locked in across every Phase 4 screen
  (marketing page, auth, shell, Discover, Categories, My Reviews).
- **Feature list** (4 KPI cards, rating-trend chart, volume chart, review management,
  sentiment breakdown, insight cards, upsell banner): [01-vision-and-scope.md](../01-vision-and-scope.md)'s
  Business dashboard description, which itself is Phase 6's own checklist item in
  [04-roadmap.md](../04-roadmap.md).
- **Tech context** (Recharts, shadcn/ui, lucide-react): [05-frontend-plan.md](../05-frontend-plan.md)'s
  stack decisions — steering the AI toward patterns that translate directly to code
  we're actually going to write, rather than bespoke illustration work someone has to
  redo by hand later.
- **Shell reuse**: the sidebar + top bar from the Authenticated shell layout ticket
  (Phase 4) is already built and approved — the prompt asks for the dashboard to live
  inside that same shell as a new nav destination, not a disconnected page.

**Deliberately left open in the prompt**: the exact reputation-score formula (rating,
volume, recency, response rate — some weighted mix, per roadmap's own open question)
and the precise backend field shapes for aggregation queries (avg rating trend, volume
by month, response rate, sentiment) — none of that is decided yet. The prompt asks for
a plausible single metric and realistic-looking mock data, the same relationship every
existing Figma Make screen already has to our actual backend (reconciled later, during
grounding — see every Phase 4 ticket's Comments section for that pattern in action).

---

```
Design a Business Dashboard screen for Rate My Place, a two-sided local business
reviews platform (regular users discover and review places; business owners manage
their listing and respond to reviews). This is the view a business-owner account
lands on — a single dashboard summarizing their business's reputation and letting
them manage incoming reviews.

VISUAL LANGUAGE — match exactly, don't invent a new style:
- Light UI: white cards on a very light slate background (#F8FAFC). This is NOT a
  dark theme — dark treatment is reserved for hero/marketing sections only, not the
  authenticated app.
- Primary color: blue #2563EB. Accent color: amber #F59E0B. Destructive: red #EF4444.
- Headings in "Plus Jakarta Sans" (600-800 weight). Body text in "Manrope"
  (400-600 weight).
- Rounded corners: 12-16px on cards (a 12px base radius, cards typically a bit
  larger at 16px).
- Cards: white background, a subtle hairline border, soft resting shadow (nothing
  heavy — shadow only intensifies on hover).
- Icon set: lucide-react, used throughout (not a different icon library).
- Reuse the existing left sidebar + top bar shell (logo mark, nav items, a
  collapsible-to-icons sidebar, avatar + menu at the bottom) — this dashboard is a
  new destination inside that same shell, not a disconnected standalone page.

LAYOUT, top to bottom:
1. Four KPI cards in a row (wrapping to 2x2 on narrower screens): Reputation Score,
   Average Rating, Total Reviews, Response Rate. Each card: an icon in a small
   colored circle, a large bold number, a label underneath, and a small trend
   indicator (e.g. "+0.2 this month" with an up/down arrow, colored green/red).
2. Two charts side by side (stacking vertically on narrower screens):
   - A rating-trend AREA CHART (smooth line with a filled gradient beneath it, in
     the primary blue) showing average rating over the last 6-12 months.
   - A review-volume BAR CHART showing number of reviews received per month over
     the same period.
3. A review management section: a list of recent reviews on this business's
   listing — reviewer name and avatar, star rating, review text, date — with a
   clear "Respond" action on reviews that have no owner reply yet, versus an
   already-visible reply block (business-owner avatar + their response text) on
   ones that do. Include a way to filter or tab between "Needs response" and "All
   reviews."
4. A sentiment breakdown panel: three horizontal progress bars — Positive /
   Neutral / Negative — each with a percentage and a distinct color (green / slate
   / red).
5. Two or three small contextual insight cards, each surfacing one specific,
   timely observation with a relevant icon — e.g. "Your response rate improved
   12% this month," "Several recent reviews mention wait times — worth a look."
6. A paid-plan upsell banner: visually distinct (a soft gradient using the primary
   and accent colors) but not dominant — inviting the owner to upgrade for deeper
   analytics, sitting at the bottom of the page, not interrupting the dashboard
   above it.

DATA CONTEXT — use as realistic illustrative mock data, not a literal spec (the
exact backend shape for this screen isn't finalized yet):
- A place has: name, category, average rating (1-5), review count, price range,
  address, phone, website.
- A review has: reviewer name and avatar, star rating (1-5), text, date, and an
  optional single owner reply.
- "Reputation Score" is a composite trust metric (not yet formally defined) —
  render it as a single headline number, similar in spirit to a credit score,
  roughly 0-100.

TECH CONTEXT — so the design translates directly to real code: this will be built
in React + Tailwind CSS + shadcn/ui components + Recharts for both charts +
lucide-react for icons. Favor patterns those libraries render well (Recharts'
AreaChart/BarChart shapes, shadcn Card/Badge/Progress primitives) over bespoke
illustration or custom SVG art that would need to be redone by hand in code.

AUDIENCE: this screen is only ever seen by business-owner accounts, viewing
analytics for a place they own. Design desktop-first, but it should hold up
reasonably at tablet width too.
```
