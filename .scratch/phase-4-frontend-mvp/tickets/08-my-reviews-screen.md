# My Reviews screen

Type: prototype
Status: closed
Claimed by: current session, 2026-08-12
Blocked by: [Design tokens](01-design-tokens.md)

## Question

What should the My Reviews screen look like and behave like — stats row, a
highlighted most-helpful review, Published/Drafts tabs, review cards with Edit/
Share/Delete, empty state?

Two things decided during this map's charting session, not open for re-litigation
here:
- Stats (total reviews, helpful votes, businesses reviewed) are computed
  **client-side** from the full `myReviews` list (`src/graphql/typeDefs/reviewTypedefs.ts`
  — no `totalCount` on `PageInfo`, no backend aggregate). Fine at MVP review volume.
- "Elite" level/badge is **dropped entirely** — Phase 5 badges concept, no backend
  support exists.

One real open question this ticket needs to resolve, surfaced but not decided during
charting: there is **no draft-review concept in the backend today** — `createReview`
just creates a review directly, nothing is ever in a non-published state. Figma's
Published/Drafts tabs assume drafts exist. Decide here whether "Drafts" means
something client-side-only (e.g. an unsubmitted form saved to local storage, never
sent to the API) or whether the tab should just be dropped for Phase 4 — don't assume
either answer going in.

Use `/prototype` (UI branch) grounded in the Figma nodes for this screen
(`get_design_context`, `figma-design-to-code` skill, fileKey
`uecnUKqT4CI7LuIpWo50Pp`).

## Resolution

**Verdict: Variant B** — resolves this ticket's own open question: the
Published/Drafts tabs from Figma are **kept**, but Drafts is explicitly a
client-side-only, this-device-only feature (browser `localStorage`, never sent
to the API), with a visible note on the tab saying so. Stats reduced to 3 cards
(Total Reviews / Helpful Votes / Businesses, all computed client-side from the
full `myReviews` list; "Contribution Level: Elite" dropped). Review photos
removed (Phase 8 Media, out of scope project-wide). Edit wired to a real inline
star+textarea form; Delete gets a confirm step (real source did neither).

Prototype committed to throwaway branch `prototype/my-reviews-screen` (commit
`b9f319b`), out of `main` per the prototype skill's capture step.

## Comments

**Build (2026-08-12)**: grounded directly in the real `MyReviewsScreen` source
(fileKey `uecnUKqT4CI7LuIpWo50Pp`, `App.tsx` ~lines 590-696), from the same
cached fetch used for the Discover/Categories tickets.

Decisions made while grounding:
- **Stats: 3 cards, not 4** — real source has a 4th "Contribution Level: Elite"
  card; dropped per this map's charting decision (Elite doesn't exist). Kept
  Total Reviews / Helpful Votes / Businesses, all computed client-side from the
  full `myReviews` list (Helpful Votes = sum of each review's `helpfulCount`).
- **Review photos removed** — the real source's review cards show photo
  thumbnails + an "add photo" control; dropped per the Place detail ticket's
  established decision (review photos are Phase 8 Media, out of scope
  project-wide, not just on that one screen).
- **Edit button wired to a real inline edit form** — the real source's Edit
  button has no `onClick` at all (decorative/unwired even in the mock). Built a
  self-contained star+textarea inline edit here rather than hard-depending on
  the Place detail ticket's still-open write/edit-review UI.
- **Delete gets a confirm step** — real source deletes immediately on click, no
  confirmation; added one since deleting a review is a real destructive action.
- **Share kept as-is** — no backend gap here; sharing a review is inherently a
  frontend-only action (copy link / native share sheet), doesn't need any API
  support.

**This ticket's own flagged open question — Published/Drafts tabs** — folded
into the variant comparison rather than decided upfront: Variant A drops the
Drafts tab entirely (no backend draft concept), Variant B keeps it as a real
but explicitly **client-side-only, this-device-only** feature (localStorage,
never sent to the API), Variant C also drops it (different structural focus).
