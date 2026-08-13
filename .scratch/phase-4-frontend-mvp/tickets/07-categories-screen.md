# Categories screen

Type: prototype
Status: closed
Claimed by: current session, 2026-08-12
Blocked by: [Design tokens](01-design-tokens.md)

## Question

What should the Categories screen (browsable grid) and its category-detail sub-screen
(top-rated grid + numbered trending list) look like and behave like, using the
`categories`/`category(id)` queries?

Business-count and avg-rating per category card are explicitly **out of scope** for
Phase 4, decided during this map's charting session — the `Category` GraphQL type
(`src/graphql/typeDefs/categoryTypedefs.ts`) exposes only `id`/`label`/`description`/
`icon`, no aggregate fields, and this map decided not to add them yet. The card design
in this ticket needs to work without those two numbers, not with them stubbed to zero
or hidden conditionally.

Use `/prototype` (UI branch) grounded in the Figma nodes for this screen
(`get_design_context`, `figma-design-to-code` skill, fileKey
`uecnUKqT4CI7LuIpWo50Pp`).

## Resolution

**Verdict: Variant A** — dark gradient hero, card grid matching Figma exactly
(cover photo + gradient overlay + centered icon/name + "N businesses · X★ avg"
meta row), click-through to a colored category-detail sub-screen (Top Rated
grid + numbered Trending list, banner subtitle also showing real count/rating).

Required reversing this ticket's own earlier no-photo/no-count decision — see
Comments below for the full reasoning. Backend gains new scope: `coverImageUrl`
on `Category` (seed-managed, no new mutation) plus live-computed
`businessCount`/`avgRating` (matches the existing `Place.averageRating`
precedent, not materialized) — shape recorded in `docs/03-architecture.md`,
flagged in `docs/04-roadmap.md` Phase 4. The fabricated platform-wide stats row
("56,700+ Total Businesses") stays dropped — that decision wasn't reversed,
only the per-category photo/count/rating was.

Prototype committed to throwaway branch `prototype/categories-screen` (commit
`ae4563f`), out of `main` per the prototype skill's capture step.

**Addendum (2026-08-12), after this ticket was already closed**: the "stats row
stays dropped" call above is now **also reversed** — the platform-wide stats row
("56,700+ Total Businesses / 10 Categories / 14M+ Reviews") is back in Variant
A, matching Figma exactly, same as the per-card reversal. "10 Categories" is
computed live from the real category list; the other two need a new
platform-wide stats query (`totalPlaces`/`totalReviews`, live `COUNT`s over
`Place`/`Review`, same "compute from source" philosophy as everything else) —
shape now recorded in `docs/03-architecture.md`'s "Also needed: platform-wide
stats" addendum. New commit on the same throwaway branch: `098a76a` (via a
temporary `git worktree`, not a branch checkout — see Comments for why).

## Comments

**Build (2026-08-12)**: grounded directly in the real `CategoriesScreen`/
`CategoryDetailScreen` source (fileKey `uecnUKqT4CI7LuIpWo50Pp`, `App.tsx`
~lines 456-585), read from the same cached fetch used for the Discover screen
ticket.

Two more real discrepancies caught, beyond the count/rating one already flagged
in the Question:
- **No cover-photo field exists.** The real source shows an Unsplash photo on
  every category card (`cat.image`), but the actual `Category` GraphQL type
  (`src/graphql/typeDefs/categoryTypedefs.ts`) only has
  `id`/`label`/`description`/`icon: String` — no image URL field at all. Cards
  built as icon+gradient only, reusing the exact 10-category accent-color
  palette already extracted in `research/design-tokens.md` (gradient/bg/icon
  color per category — the real source's own hardcoded per-category style
  table, confirmed to match doc 1's 10 categories exactly).
- **The "56,700+ Total Businesses / 14M+ Reviews" stats row has no backend
  source.** Unlike the marketing landing page (where hardcoded vanity stats are
  the normal, already-decided pattern), this row sits inside the authenticated
  app — showing fabricated platform-wide numbers there is a different call than
  marketing copy. Only "10 Categories" is real (`categories().data.length`);
  **dropped the entire stats row** rather than keep 2 fake numbers + 1 real one,
  consistent with this map's own precedent (Discover's "Recommended" strip, the
  category count/rating fields) of not fabricating aggregate data with nothing
  behind it.

Category-detail's "Top Rated" grid and "Trending Now" numbered list map directly
onto existing capability — `listPlaces(filter: {categoryId}, sort:
HIGHEST_RATED)` and `listPlaces(filter: {categoryId}, sort: TRENDING)` — no
backend gap there.

**Reversed (2026-08-12)**: the no-photo/no-count decision above and in this
ticket's Question is now **overridden** — user wants Variant A to match Figma
exactly (cover photo + "N businesses · X★ avg" per card), not a lighter
adaptation. Rather than treat this as prototype-only mock data, decided to
extend the backend for real: new `coverImageUrl` field on `Category` (seed-data
managed, no new mutation) plus live-computed `businessCount`/`avgRating`
(matching the existing `Place.averageRating`/`reviewCount` "recompute from
source" precedent, not materialized). Full shape in
[03-architecture.md](../../../docs/03-architecture.md)'s new "Planned: `Category`
cover image + live business-count/avg-rating" section; flagged as new Phase 4
scope in [04-roadmap.md](../../../docs/04-roadmap.md). MAP.md's original
charting-session decision updated to point here rather than silently
contradicted.

**Process note (2026-08-12)**: discovered that the capture pattern used on every
prior ticket (`git checkout -b prototype/X`, commit, `git checkout <working
branch>`) silently **deletes the prototype file from the working directory**
once returning to the working branch — because the file becomes tracked on the
throwaway branch, then "absent" on the branch being returned to, and plain
`checkout` deletes tracked-then-absent files. Not data loss (everything's safe
in each throwaway branch's history), but every previously captured prototype
file had vanished from disk. Restored all seven via `git show
<branch>:<path> > <path>` (writes the blob directly, bypassing the index, so
they stay untracked on the working branch exactly as before). For this
addendum, used a temporary `git worktree` instead of `checkout` to commit
without touching the main working directory at all — the safer pattern going
forward for any further amendments to already-captured tickets.
