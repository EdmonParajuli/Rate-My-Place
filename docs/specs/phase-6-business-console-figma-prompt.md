# Phase 6 — Business Console: Figma AI Prompt (remaining nav destinations)

Not a spec — prep material, same role as
[phase-6-business-dashboard-figma-prompt.md](./phase-6-business-dashboard-figma-prompt.md)
played for the Dashboard page itself.

## Why this exists

Building the real Business Dashboard screen surfaced a decision that had been
deferred since Phase 4: business-owner accounts were getting the *same* sidebar as
regular reviewer accounts (Discover / Categories / My Reviews), with "Dashboard"
just bolted on. That was a deliberate Phase 4 stopgap ("no dashboard placeholder to
build and discard"), not a permanent design — now that a real Dashboard exists, the
stopgap condition no longer holds.

Revisiting it: `REGULAR` and `BUSINESS` are mutually-exclusive account types in this
product (not a dual-role account — `signUpBusiness` creates a `BUSINESS` user tied to
one place), and Discover/Categories/My Reviews are all reviewer-persona features with
no real tie to managing a business listing. The Figma Make source's own
`BusinessDashboardLayout` already reflects the more correct mental model — a
dedicated business-owner console, separate from the consumer app, matching how real
products (Yelp for Business, Google Business Profile) separate the owner console
entirely. **Decided: business accounts get their own nav, Dashboard-first — not the
reviewer nav with Dashboard appended.**

That dedicated shell's other five nav items (My Listing, Reviews, Analytics,
Promotions, Settings) exist in the Figma Make source only as "This section is
currently under construction" placeholders — nothing real behind any of them yet.
This prompt asks Figma Make to design all five, the same way the Dashboard page
itself was designed before being built for real: something concrete to react to and
ground the eventual ticket work against, instead of designing blind.

**How to use this**: paste the fenced prompt below as a *follow-up* prompt into the
same Figma Make file the Dashboard was generated in
(`https://www.figma.com/make/oVTXc2TbEHvaGM5mVXL6L1/Design-Rate-My-Business-UI`) —
it already has the shell, tokens, and Dashboard page to build against, and Figma
Make iterates on a file rather than starting over. Everything above and below the
block is context for *why* it's written this way, not part of the prompt itself.

## Where this prompt's constraints come from, and how grounded each page is

Same visual-language/tech-context sourcing as the Dashboard prompt
([research/design-tokens.md](../../.scratch/phase-4-frontend-mvp/research/design-tokens.md),
[05-frontend-plan.md](../05-frontend-plan.md)). Per-page, how much of the ask maps to
real backend capability today (see [03-architecture.md](../03-architecture.md) and
[04-roadmap.md](../04-roadmap.md)) varies a lot — flagged inline in the prompt itself
so grounding later doesn't have to rediscover this:

- **My Listing** — fully real. `updatePlace` and `setPlaceHours` mutations already
  exist; every field asked for is a real, already-modeled column.
- **Reviews** — fully real. A dedicated, full-featured version of what the Dashboard
  already does with `placeReviews`/`createReviewReply` in miniature — pagination and
  `ReviewSortEnum` (`RECENT`/`HELPFUL`) already exist.
- **Analytics** — partially real. Rating distribution and the two trend charts reuse
  fields the Dashboard already computes (`Place.ratingBreakdown`, monthly rating/
  volume). Keyword/topic mentions and competitor benchmarking have zero backend
  behind them (same "Pro" upsell copy the Dashboard already shows) — illustrative
  only, explicitly flagged in the prompt.
- **Promotions** — **not real at all**. No promotions/offers/monetization concept
  exists anywhere in this product's docs. Purely exploratory — included because the
  Figma source invented the nav destination, not because it's a planned feature.
  Treat anything this page produces as a starting conversation, not a commitment.
- **Settings** — partially real. Account info + password change map to the existing
  `authMeUser`/`changePassword` mutations. Notification preferences have no backend
  (`NOTIFICATIONS` is Phase 5, unbuilt) — illustrative only. Deliberately scoped
  smaller than the full [Phase 7](../04-roadmap.md) settings vision (2FA, data
  export, delete account, blocked users) — those are account-type-agnostic and much
  bigger than "business console navigation," not re-scoped into this prompt.

---

```
This is a follow-up to the Business Dashboard page already built in this file
(BusinessDashboardLayout / BusinessDashboardHome). Design the five other pages
that layout's sidebar already links to, currently placeholder "under construction"
screens: My Listing, Reviews, Analytics, Promotions, and Settings.

VISUAL LANGUAGE — match the existing Dashboard page exactly, don't invent a new
style: light UI, white cards on #F8FAFC, primary blue #2563EB, accent amber #F59E0B,
destructive red #EF4444, Plus Jakarta Sans headings / Manrope body, 12-16px card
radius, hairline borders + soft resting shadow, lucide-react icons throughout. Reuse
the exact same left sidebar + top bar shell already built — these are five more
destinations inside it, not disconnected pages. Keep desktop-first, holding up
reasonably at tablet width.

TECH CONTEXT: React + Tailwind + shadcn/ui + Recharts (charts) + lucide-react,
same as the Dashboard page.

═══════════════════════════════════════════════════════════════════
PAGE 1 — MY LISTING
═══════════════════════════════════════════════════════════════════
A form for the business owner to edit their public listing. Two-column layout: the
edit form on the left, a live-updating preview card on the right showing exactly
how the listing appears to a visitor (same card style Discover/Categories use).

Fields, grouped in sections:
- Basics: business name, category (dropdown, single-select), short description
  (textarea)
- Contact & location: address, phone, website
- Pricing: price range selector — exactly 3 tiers ($ / $$ / $$$), not 4
- Hours: a day-by-day editor (Monday-Sunday), each day with an open toggle and
  open/close time pickers, "closed" state for days off

Each field/section shows a clear saved/unsaved state and a prominent "Save Changes"
button (disabled until something changes). Include a subtle "last updated" timestamp
near the save button.

Explicitly NOT in scope for this page (don't design them): a logo/cover photo
uploader (no photo infrastructure exists yet), amenity/feature tag editing (no such
concept exists yet). If you want to show a photo area, render it as an obvious
"Photo uploads coming soon" placeholder, not a working uploader.

═══════════════════════════════════════════════════════════════════
PAGE 2 — REVIEWS
═══════════════════════════════════════════════════════════════════
A dedicated, full review-management page — a fuller version of the Dashboard's
review list, not a different design language.

- A small stats strip at the top: total reviews, average rating, reviews awaiting a
  reply — three compact stat tiles, not full KPI cards.
- Sort control (Most Recent / Most Helpful) and a filter (All / Needs Response).
- A paginated list of reviews (reviewer avatar/name, star rating, date, text),
  each with the same "Respond" composer / already-visible reply block pattern the
  Dashboard page uses — reviewer identity, owner reply visually distinguished with
  an "Owner" badge.
- Pagination control at the bottom (page numbers or a "Load more" pattern — your
  call, whichever reads cleaner here).

═══════════════════════════════════════════════════════════════════
PAGE 3 — ANALYTICS
═══════════════════════════════════════════════════════════════════
A deeper analytics page than the Dashboard's two charts. Include a date-range
selector at the top (e.g. Last 3 / 6 / 12 months) that would filter everything
below it.

Grounded in real, already-available data — design these properly, not as filler:
- The same rating-trend area chart and review-volume bar chart as the Dashboard,
  now full-width and responsive to the date-range selector
- A rating-distribution chart: a bar per star value (1-5) showing review counts

Illustrative only — clearly still design these (this is what "Pro" upsells toward),
but a small "Sample data — full analytics coming with Pro" style badge or caption
near them so it reads as aspirational, not a data promise:
- A keyword/topic mentions panel (e.g. "wait times," "friendly staff," "great
  coffee" as tags sized by mention frequency)
- A simple competitor-benchmark comparison (this business's rating/review-volume
  vs. category average)

═══════════════════════════════════════════════════════════════════
PAGE 4 — PROMOTIONS
═══════════════════════════════════════════════════════════════════
This is the most speculative page — there's no existing product decision behind it,
purely exploring what a lightweight promotions surface could look like for a small
local business. Design it as: a list of promotions/offers the owner has created
(name, type — e.g. "10% off," "Featured placement," dates active, a status badge
Active/Scheduled/Ended), a prominent "Create Promotion" button, and an empty state
for a business with none yet. Keep it simple - a handful of promotion types, not a
full campaign-management suite.

═══════════════════════════════════════════════════════════════════
PAGE 5 — SETTINGS
═══════════════════════════════════════════════════════════════════
Scoped to what's relevant from the business-owner console specifically, not a full
account-settings suite. Two sections/tabs:
- Account: business owner's name, email (editable), a "Change Password" flow
  (current password + new password + confirm)
- Notifications: a handful of toggle rows for email notifications — new review
  received, review needs a reply reminder, weekly summary email

Keep this page noticeably lighter/shorter than the other four - it's a small,
secondary destination, not a primary one.
```
