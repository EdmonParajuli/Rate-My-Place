# Roadmap

Phased so each phase ships something usable end-to-end, rather than finishing "all of
the backend" before touching a frontend. Update the checkboxes as work lands — this
doc is meant to be edited, not archived.

## Phase 0 — Done

- [x] Project scaffold, TypeScript + Express + Apollo + Sequelize + Postgres wired up
- [x] Users: signup, login, JWT issuance, `authMeUser`
- [x] Places: create/update/delete/getById, owner-gated writes
- [x] Migrations for categories, reviews, review replies (schema only)

## Phase 1 — Close out the backend's existing surface

Small, mostly mechanical, and removes the sharpest edges before more code copies them.

- [ ] Fix the `authMeUser` / JWT payload field mismatch (doc 2, issue 1)
- [ ] Fix `requireOwner` to check resource ownership, not just role (doc 2, issue 2)
- [ ] Remove or implement `signOut`/`forgotPassword`/`changePassword`/`confirmForgotPassword` (doc 2, issue 3)
- [ ] Delete or finish `userTypedefs.ts` (doc 2, issue 4)
- [ ] Standardize the GraphQL error `extensions.status` type (doc 2, issue 6)
- [ ] Add a `SESSIONS` table + wire refresh-token issuance/revocation through it (unblocks logout and "active sessions" later)

## Phase 2 — Reviews (the core loop)

This is the feature the entire product is named after — prioritize it over dashboards
or notifications.

- [ ] `Category` model/repository/service/resolver (migration already exists) — needed as an FK target and for the Categories screen
- [ ] `Review` model/repository/service/resolver: create/update/delete/getByPlace/getByReviewer, enforcing one review per (user, place)
- [ ] `ReviewReply` model/repository/service/resolver: owner-only reply, one reply per review
- [ ] Recompute `Place.averageRating`/`reviewCount` on review create/update/delete (service-layer, inside a transaction)
- [ ] `REVIEW_VOTES` table + helpful-vote mutation/query

## Phase 3 — Discovery

Makes the Discover screen real instead of a single `getPlaceById`.

- [ ] `listPlaces` query: filters (category, price range, min rating, open now), sort (rating/trending/new/nearby), pagination via the existing `PageInfoInterface`/`edges` shape
- [ ] `price_range` column + `PLACE_HOURS` table, "open now" computed from hours + server timezone
- [ ] Basic geolocation/"nearby" — decide now whether this is PostGIS/lat-lng + Haversine, or deferred to a real geo service later (see open questions)

## Phase 4 — Frontend MVP

Stand up the frontend against Phases 1–3's API. See
[05-frontend-plan.md](./05-frontend-plan.md) for the stack decision.

- [ ] Project scaffold + design tokens matching the Figma dark-gradient aesthetic
- [ ] Auth flows: signup, login, authenticated shell (sidebar nav matching Figma)
- [ ] Discover screen (search, filters, sort, card grid)
- [ ] Place detail + write/edit a review
- [ ] Categories screen
- [ ] My Reviews screen

## Phase 5 — Personalization

- [ ] `SAVED_PLACES` table + resolver + Saved screen (four tabs)
- [ ] `NOTIFICATIONS` table + resolver + Notifications screen; decide the triggering events (new reply to your review, business responds, etc.)
- [ ] Profile screen (stats, activity chart, badge grid)
- [ ] `BADGES`/`USER_BADGES` — start with 3-5 real criteria, not the full grid from the design

## Phase 6 — Business dashboard

- [ ] Aggregation queries: reputation score formula (define it explicitly — this is a
      product decision, not just an engineering one), avg rating trend, review volume
      by month, response rate, sentiment breakdown
- [ ] Review management UI (respond/replied states) — reuses `ReviewReply` from Phase 2
- [ ] Business dashboard frontend screen (KPI cards + charts)

## Phase 7 — Settings & account lifecycle

- [ ] Account fields edit, preferences (dark mode, language/timezone — note dark mode
      needs to exist as a real frontend theme, not just a design mockup)
- [ ] Notification preference toggles
- [ ] Privacy: blocked users, data export (GDPR-style — decide scope now, it constrains the data model)
- [ ] Security: 2FA, active sessions list + revoke (built on the Phase 1 `SESSIONS` table)
- [ ] Delete-account flow with typed confirmation + actual data retention/anonymization policy

## Phase 8 — Media

Deliberately last-but-not-forgotten: photos touch places, reviews, and users, so it's
cheaper to build once the shapes of those three are stable.

- [ ] Pick an object storage provider (see doc 6) + the `MEDIA` table from doc 3
- [ ] Upload flow (signed URLs, not routing file bytes through the GraphQL server)
- [ ] Wire into place photos, review photos, avatar/cover

## Phase 9 — Hardening for production

Not really sequential — start doc 6's testing/CI recommendations as early as Phase 1,
don't save all of it for the end. This phase is "the remaining, harder ops work":
deployment pipeline, rate limiting/query cost limiting, observability, load testing.

## Open questions worth resolving before/around Phase 3-4

These are yours to decide, not technical inevitabilities — flagging so they don't get
decided by accident:

1. **Repo shape**: keep frontend in this same repo (e.g. `/web` alongside the current
   root-level backend) or a separate repo? Monorepo is easier for a solo dev sharing
   types between GraphQL schema and frontend codegen; separate repos are cleaner if
   you ever want independent deploy cadences or a different team boundary.
2. **Geo/"nearby"**: real geospatial queries (PostGIS) vs. a simpler bounding-box/city
   field for the MVP. The Figma design shows a city picker ("Brooklyn, NY"), which
   suggests city-level filtering may be enough for launch.
3. **Reputation score formula**: what actually goes into it (rating, volume, recency,
   response rate)? This is a product/business decision that the dashboard's
   credibility depends on.
4. **Data export & delete-account scope**: full GDPR-style compliance, or a lighter
   "reasonable effort" version for an MVP? Affects the data model (need to track what
   must be exportable) and how soft-delete/anonymization interact.
