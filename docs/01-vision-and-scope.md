# Vision & Product Scope

## What this product is

**Rate My Place** (working brand in the design: "RateMyBiz") is a two-sided reviews
marketplace: **regular users** discover and review local businesses ("places"), and
**business owners** claim/manage a listing, respond to reviews, and read analytics
about their reputation. It's the same shape as Yelp/Google Business Profile, scoped
down to an MVP.

The two user types already exist in the backend (`UserTypeEnum.REGULAR` /
`UserTypeEnum.BUSINESS`) and drive authorization (`requireOwner` in
[auth.ts](../src/utils/auth.ts)) — this is the right foundational decision and
everything downstream (screens, permissions, data model) hangs off it.

## Source of truth for design

Design reference: a Figma Make prototype at
`https://www.figma.com/make/uecnUKqT4CI7LuIpWo50Pp/Rate-My-Business-UI-UX-Design`.

> **Note:** the link you pasted had mismatched anchor text vs. destination — the
> visible text pointed at a file (`.../oVTXc2TbEHvaGM5mVXL6L1/Design-Rate-My-Business-UI`)
> that turned out to be an empty/unstarted Figma Make file, while the actual `href`
> (`.../uecnUKqT4CI7LuIpWo50Pp/Rate-My-Business-UI-UX-Design`) is the real, fully-built
> prototype with two design versions inside it. Everything below is drawn from that
> second one. Worth double-checking next time you share a link that it points where
             you think it does.

The prototype has two versions describing an overlapping but not identical scope.
Treat **Version 1** as the reviewer/business *app* (post-login product) and
**Version 2** as the *marketing landing page + two dashboard concepts*. Combined,
they describe the full product surface:

### Marketing site (logged-out)
- Dark-gradient hero, headline, search bar with quick-filter tags, animated mesh background
- Stats strip (reviewer count, business count, review count, satisfaction %) — marketing vanity metrics, not necessarily real-time
- "For Reviewers" section: feature cards + business cards with save/heart toggle, badges, price range
- Recent reviews carousel with helpful-vote interaction
- "For Businesses" section: feature list + live dashboard preview (dark mode, embedded chart)
- Testimonial carousel (dual voice: reviewer / business)
- CTA banner + footer

### Core app — Regular user ("Reviewer") side
1. **Discover** (home/search) — hero search with location, filter panel (category, price
   range, min rating, "open now" toggle), sort tabs (Highest Rated / Trending / New /
   Nearby), business card grid with empty state, plus horizontal strips (Trending, New
   Nearby, Recommended).
2. **Categories** — browsable category grid (10 categories with cover image, icon,
   business count, avg rating) and a category detail sub-screen (top-rated grid +
   numbered trending list).
3. **My Reviews** — stats (total reviews, helpful votes, businesses reviewed, "Elite"
   level), a highlighted most-helpful review, Published/Drafts tabs, review cards with
   photos + Edit/Share/Delete, empty state.
4. **Saved** — four tabs (All Saved / Want to Visit / Reviewed / Favorites), cards with
   list-type badge, hover-reveal remove, saved date.
5. **Notifications** — 6 filter tabs with unread badges, mark-as-read, mark-all-read,
   delete.
6. **Profile** — cover + avatar, stats row, activity chart, achievement/badge grid
   (earned vs. locked), recent reviews preview.
7. **Settings** — Account (inline-editable fields), Preferences (dark mode,
   language/timezone), Notifications (toggles), Privacy (toggles, blocked users, data
   export), Security (2FA toggle, active sessions with revoke), Danger Zone (delete
   account with typed confirmation).
8. **User dashboard variant** — profile header, personalized feed with hover "Review"
   action, review history, badge grid, saved list, write-a-review CTA.

### Core app — Business owner side
- **Business dashboard** — 4 KPI cards (Reputation Score, Avg Rating, Total Reviews,
  Response Rate), a rating-trend area chart + monthly-volume bar chart, review
  management (respond/replied states), sentiment breakdown (progress bars), contextual
  insight cards, and a paid-plan upsell.

## Feature inventory → backend entities

This is the mapping that matters most for planning: every UI feature implies data that
has to exist somewhere. Cross-reference against [02-current-state.md](./02-current-state.md)
for what's actually built, and [03-architecture.md](./03-architecture.md) for the data
model this implies.

| Figma feature | Implied backend concept | Status |
|---|---|---|
| Sign up / log in, two user types | Users, auth, JWT | ✅ built |
| Business listing, category, address, phone, website | Places, Categories | 🟡 Places built, Categories only migrated |
| Star rating + written review | Reviews | 🟡 migrated only, no model/service/resolver |
| Owner responds to a review | Review replies | 🟡 migrated only, no model/service/resolver |
| Save / heart a business, "Want to visit", "Favorites" tabs | Saved places (bookmarks) | ❌ not started |
| "Helpful" vote on a review | Review helpful votes | ❌ not started |
| Notifications tab, unread counts | Notifications | ❌ not started |
| Badges / achievements / "Elite Reviewer" | Badges, user badges/points | ❌ not started |
| Review photos, business photos, cover image, avatar | Media/file storage | ❌ not started (no upload strategy at all yet) |
| Category browsing, business count per category | Categories | 🟡 migrated only |
| "Open Now" filter | Business hours | ❌ not modeled |
| Price range ($/$$/$$$) | Field on Places | ❌ not modeled |
| Verified badge | `isVerified` on Places | ✅ column exists |
| Search + filter + sort on Discover | Query/index strategy on Places | ❌ not started (only `getPlaceById` exists) |
| Business KPI dashboard (reputation score, response rate, sentiment) | Aggregation queries/materialized views | ❌ not started |
| Active sessions with revoke, 2FA | Refresh-token/session persistence, 2FA secret | ❌ not started (current refresh tokens aren't persisted or revocable) |
| Blocked users, data export, delete account | Privacy/compliance endpoints | ❌ not started |

Read this table as the backlog, not as a commitment to build every row — see
[04-roadmap.md](./04-roadmap.md) for what's actually worth building for an MVP vs. later.
