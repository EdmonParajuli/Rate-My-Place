# Current State Audit

Honest snapshot as of 2026-07-29. Nothing here is a criticism of pace — this is a
young project and the foundation (layering, validation, soft deletes, generic
repository) is genuinely solid. This doc exists so the next session doesn't have to
re-derive it by reading every file again.

## What's built

**Stack:** Node.js + TypeScript, Express, Apollo Server (via `@apollo/subgraph`'s
`buildSubgraphSchema` — see note below), Sequelize + PostgreSQL, Joi validation,
JWT auth, bcrypt hashing. No frontend exists yet — this is a backend-only repo today.

**Layering** (see [03-architecture.md](./03-architecture.md) for the full picture):
`typeDefs → resolvers → services → repositories (generic BaseRepository<IT,RT>) → Sequelize models`.
Consistent across the two features that exist (auth, places).

**Entities with a full vertical slice (model → repository → service → resolver → typeDefs):**
- **Users** — signup, login, `authMeUser`, password hashing, JWT issuance. No update/delete yet (typeDefs for it exist but are dead code — see below).
- **Places** — create/update/delete/getById, owner-gated writes.

**Entities with only a migration (table exists, nothing else):**
- **Categories** (`providers_category`)
- **Reviews** (`providers_reviews`)
- **Review replies** (`providers_reviews_replies`)

**Cross-cutting infrastructure already in place and worth keeping:**
- Centralized Joi schema primitives ([schemas.ts](../src/validators/schemas.ts)) reused across validators — good, keep building on this instead of inlining `Joi.string()` everywhere.
- `SuccessResponse` envelope ([responseHelper.ts](../src/helpers/responseHelper.ts)) standardizes `{message, data, edges, pageInfo, count}` — the `edges`/`pageInfo` shape signals cursor-pagination intent (`PageInfoInterface`) even though nothing paginates yet.
- `BaseRepository<IT, RT>` ([baseRepository.ts](../src/repositories/baseRepository.ts)) — a real generic data-access layer (find/findOne/findByPk/findAndCountAll/count/create/update/delete/restore/rawQuery). New entities should extend this, not hand-roll queries.
- Soft deletes (`paranoid: true`) + `underscored: true` + explicit `field:` mappings on every model — consistent convention, keep it.
- Config module ([config/index.ts](../src/config/index.ts)) fails fast on missing env vars via `mustExist` — good pattern, extend it rather than reading `process.env` ad hoc elsewhere.

## Known issues / tech debt

Issues 1–6 below were Phase 1's punch list and are now **fixed** on branch
`rmp-2-phase-1-backend-hardening` (see
[specs/phase-1-backend-hardening.md](./specs/phase-1-backend-hardening.md) for the
design and this repo's git history for the actual commits). Kept here, marked done,
so this doc stays an honest record of what was true and when it changed — not deleted
outright, since "issue 1 doesn't exist anymore" is itself useful history.

1. ~~`authMeUser` is very likely broken~~ **Fixed.** Standardized on `id` across the
   JWT payload, `ContextInterface.user` (now a dedicated `AuthTokenPayload` type
   instead of the misleading full `UserInterface`), and every call site.
2. ~~`requireOwner` checks role, not resource ownership~~ **Fixed.**
   `PlaceService.updatePlace`/`delete` now take the requesting user's id and reject
   with `FORBIDDEN`/403 when it doesn't match the place's `ownerId`.
3. ~~Schema/resolver drift in auth (`signOut`/`forgotPassword`/`changePassword`/
   `confirmForgotPassword` declared but unimplemented)~~ **Fixed.** All four are
   implemented end to end, including a new sessions system they depend on (see
   the spec's §6).
4. ~~`userTypedefs.ts` is dead and self-inconsistent~~ **Fixed.** File deleted.
5. ~~No refresh-token persistence or revocation~~ **Fixed.** New `providers_sessions`
   table + `SessionService`: refresh tokens are hashed and persisted at
   issuance, rotated on renewal (`refreshAccessToken`), and revocable
   (`signOut`, `revokeSession`, or automatically on password change/reset). A new
   `activeSessions` query lists them.
6. ~~Inconsistent GraphQL error `status` typing~~ **Fixed.** A `throwError(message,
   code, status)` helper in `src/helpers/errorHelper.ts` is now the only way any
   resolver throws, `status` is always a number, and resolver `catch` blocks no
   longer swallow and rewrap `GraphQLError`s thrown by the service layer (they used
   to — which would have silently turned the new 403/404s above back into a generic
   400).

**Discovered while manually verifying Phase 1 against a live server — also fixed on
the same branch, not called out in the original spec because they weren't known yet:**

- **A stray `src/models/index.js`** (leftover `sequelize-cli init` boilerplate from
  the very first commit) shadowed the real `src/models/index.ts` at Node's module
  resolution level. Every repository's `Model.X` was `undefined` at request time —
  **signUp, login, and the entire Places API have been non-functional end-to-end since
  the first commit**, despite the server booting and connecting to the DB
  successfully (the DB connection doesn't go through this file, only the repositories
  do). This is exactly the kind of bug that only manual, live testing catches — the
  code compiles fine and looks correct on paper. Deleted the stray file.
- **Refresh tokens collided within the same second.** `jwt.sign` is deterministic
  given identical payload+secret+timing; two tokens issued for the same user inside
  the same second (e.g. signup immediately followed by login) were byte-identical,
  colliding with the new sessions table's unique hash constraint. Fixed by adding a
  random `jti` claim to refresh tokens.
- **`updatePlace`/`deletePlace` had resolvers but no schema declaration.** Both were
  fully implemented in `placeResolver.ts` (Phase 0) but never added to
  `placeTypedefs.ts`, so neither was actually callable via GraphQL. Added.

**Still open — found, deliberately not fixed here, out of scope for Phase 1:**

- **`SignUpData` doesn't match what `signUp` actually returns.** The schema declares
  `type SignUpData { email, userType }`, but the resolver returns
  `{ user, token }` (matching `login`'s shape). Querying `signUp { data { user { ... }
  } }` fails schema validation, and the fields the schema *does* declare
  (`email`/`userType`) don't resolve from that shape either — `signUp` cannot
  currently return usable tokens to a caller at all. Pre-existing (confirmed on
  `main` before this branch), unrelated to any Phase 1 item, and worth its own small
  fix — either change `SignUpData` to match `UserData`/`LoginToken`, or have the
  resolver return only what's declared and require a follow-up `login` call.
- **`updatePlace`'s validator requires every field**, so it doesn't actually support
  partial updates (it reuses `createPlaceSchema` verbatim). Pre-existing, not part of
  the ownership fix, worth a dedicated `updatePlaceSchema` when someone next touches
  this resolver.
- Issue 7 (no tests/CI) and issue 8 (singular `providers_category` table name) from
  the original list are still open — not touched by Phase 1.

None of this blocks moving forward — it's a punch list to burn down alongside the
next couple of features, not a prerequisite for starting them.
