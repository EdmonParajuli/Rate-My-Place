# Phase 4, Ticket 06 — Place Detail + Write/Edit Review: Figma AI Prompt

Not a spec — prep material, same purpose as
[phase-6-business-dashboard-figma-prompt.md](./phase-6-business-dashboard-figma-prompt.md)
but for a different, unrelated screen: **ticket
[06-place-detail-review.md](../../.scratch/phase-4-frontend-mvp/tickets/06-place-detail-review.md)**
on the current Phase 4 wayfinder map (`.scratch/phase-4-frontend-mvp/MAP.md`) — not
roadmap Phase 6. The two share the number "6" by coincidence of two different
numbering systems (wayfinder ticket order vs. roadmap phase order); this doc is about
the former.

Confirmed during that ticket's own grounding work: **no Figma source exists for
place-detail in either Figma Make file** (checked both — the "core app" file's
`Screen` union has no `place-detail` state, and "Version 2" has no matching
component either). Same situation as the dashboard — worth getting an AI-generated
design first rather than composing this screen from scratch by hand.

**How to use this**: copy the prompt in the fenced block below as-is into Figma Make
(or whichever Figma AI surface you're using). Everything outside the block is context
for why it's written this way.

## Where this prompt's constraints come from

- **Visual language**: the same validated tokens as every other Phase 4 screen —
  [research/design-tokens.md](../../.scratch/phase-4-frontend-mvp/research/design-tokens.md).
- **Real backend fields** (so the AI's mock data doesn't invent things we can't
  actually populate): `Place` (`src/graphql/typeDefs/placeTypeDefs.ts`) —
  `label`, `description`, `address`, `phone`, `website`, `category: String`,
  `averageRating`, `reviewCount`, `isVerified`, `priceRange`, `hours: [PlaceHour]`,
  `openNow`, `owner: User`. `Review` (`src/graphql/typeDefs/reviewTypedefs.ts`) —
  `review`, `rating`, `reviewer`, `helpfulCount`, `helpfulByMe`. `ReviewReply`
  (`src/graphql/typeDefs/reviewReplyTypedefs.ts`) — one optional `reply` per review,
  `description` text only.
- **Standing decisions from this map**, not re-litigated by this prompt:
  - Owner replies are **included** in Phase 4 (mutation already exists) — the
    prompt asks for that flow explicitly, not deferred to a future dashboard.
  - Review photos are **out of scope** (Phase 8 Media) — the prompt asks for a
    text + star-rating review form only, no photo upload anywhere on this screen.
  - Save/heart toggle is **omitted** everywhere in Phase 4 (Saved Places is Phase
    5) — don't ask the AI for one on this screen either.
- **Shell reuse**: same approved sidebar + top bar shell as every other screen —
  this is a new destination inside it (reached by clicking a place card), not a
  disconnected page.

---

```
Design a Place Detail screen for Rate My Place, a two-sided local business reviews
platform. This is what a user sees after clicking into a specific place from the
Discover or Categories screens — full details on that place, its reviews, a way to
write or edit your own review, and (for the business owner viewing their own place)
a way to reply to reviews.

VISUAL LANGUAGE — match exactly, don't invent a new style:
- Light UI: white cards on a very light slate background (#F8FAFC). Not a dark
  theme — dark treatment is reserved for hero/marketing sections only.
- Primary color: blue #2563EB. Accent color: amber #F59E0B. Destructive: red
  #EF4444.
- Headings in "Plus Jakarta Sans" (600-800 weight). Body text in "Manrope"
  (400-600 weight).
- Rounded corners: a 12px base radius, cards typically a bit larger at 16px.
- Cards: white background, a subtle hairline border, soft resting shadow.
- Icon set: lucide-react throughout.
- Reuse the existing left sidebar + top bar shell (logo, nav items, a
  collapsible-to-icons sidebar, avatar + menu at the bottom) — this screen is
  reached by clicking into a place from Discover or Categories, not a
  disconnected standalone page. Include a clear "back" affordance to return to
  wherever the user came from.

LAYOUT, top to bottom:
1. Place header: a cover image, then the place's name, category, a verified
   badge if applicable, star rating + review count, price range ($/$$/$$$ — a
   3-tier scale, not 4), an open/closed status pill, and contact info (address,
   phone, website) with a map-pin icon next to the address. A prominent primary
   button: "Write a Review."
2. If the current viewer is the place's own business owner (design a visible
   toggle or two states to show both — regular visitor vs. owner — since this
   flow needs to demonstrate both), the header instead emphasizes owner-facing
   context (e.g. no "Write a Review" button — owners can't review their own
   place — but a clear indicator this is their listing).
3. A reviews section: each review shows the reviewer's name and avatar, star
   rating, review text, date, and a "Helpful" toggle button with a count (e.g. a
   thumbs-up icon that fills in and increments when clicked). Text and star
   rating only — no photo attachments anywhere in this flow.
4. Owner replies: if a review already has an owner reply, show it as a nested,
   visually distinct block directly under that review (e.g. indented, with the
   business's avatar/name and a subtly different background). If a review has
   no reply yet AND the current viewer is the owner, show a clear "Reply" button
   that opens a small inline text composer under that review.
5. Write/edit review flow: a star-rating picker (1-5, tap/click to select) and a
   text area, with Submit/Cancel actions. If the current user already has a
   review on this place, show it pre-filled with a way to edit or delete it,
   rather than a second "write a review" entry point (one review per place per
   person).
6. Empty state for the reviews section: no reviews yet, with a message
   encouraging the viewer to be the first to review.

DATA CONTEXT — realistic illustrative mock data, matching what's actually
available on the backend (not literal requirements — exact copy adapts to
network data later, but keep the entity shape below the same):
- A place has: name, category, description, address, phone, website, average
  rating (1-5), review count, verified status, price range ($/$$/$$$, three
  tiers), open/closed status, and an owner.
- A review has: reviewer name and avatar, star rating (1-5), text, a helpful-
  vote count with a toggle state (has the current viewer marked it helpful),
  and an optional single owner reply (text only).

TECH CONTEXT — so the design translates directly to real code: this will be
built in React + Tailwind CSS + shadcn/ui components + lucide-react for icons.
Favor patterns those libraries render well (shadcn Card/Badge/Avatar/Textarea
primitives) over bespoke illustration.

AUDIENCE: every logged-in user reaches this screen (regular reviewers writing/
reading reviews; business owners managing their own listing's reviews). Design
desktop-first, but it should hold up reasonably at tablet width too.
```
