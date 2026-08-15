# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Rate My Place: a two-sided reviews marketplace (regular users review local
businesses; business owners manage listings and respond). A GraphQL API on
Node/TypeScript/Apollo/Sequelize/PostgreSQL, now split into a monorepo per
`docs/05-frontend-plan.md`'s repo shape: `backend/` (everything below, moved as-is
from the former repo-root `src/`) and `frontend/` (not yet scaffolded — no frontend
code exists yet). Two independent `package.json`s, no npm workspaces. Full
design/reference docs live in `docs/` (stays at repo root) — read `docs/README.md`
first for the reading order (vision → current-state → architecture → roadmap →
frontend plan → quality/ops); `docs/04-roadmap.md` and `docs/02-current-state.md`
are the living docs, kept up to date as work lands.

## Commands

All commands below run with `backend/` as the working directory (`cd backend`
first, or prefix with `npm --prefix backend`).

```bash
cd backend
npm install
cp .env.example .env        # see required vars below; config fails fast if any are missing
npm run db:migrate          # apply migrations (sequelize-cli, via .sequelizerc -> src/config/database.js)
npm run start:dev           # dev server: nodemon + ts-node --type-check, http://localhost:<PORT>/graphql
npm run build                # tsc typecheck/build to dist/
```

Other scripts: `build:watch`, `start:transpile` (nodemon + ts-node `--transpileOnly`,
skips type checking for faster iteration), `start`/`start:watch` (run compiled
`dist/`), `clean`, `db:migrate:undo`, `db:migrate:undo:all`, `db:seed`, `db:seed:undo`.

Required env vars (see `.env.example`): `DB_HOST`, `DB_USER`, `DB_PASSWORD`,
`DB_NAME`, `DB_DIALECT`, `DB_PORT`, `PORT`, `PASSWORD_HASH_CONSTANT`,
`JWT_ACCESS_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_SECRET`,
`JWT_REFRESH_EXPIRES_IN`.

**No test suite exists** — no test runner is configured (`npm test` doesn't exist).
Verification in this codebase is manual: run `npm run build` (both `backend/` and
`frontend/`) for type errors, then exercise the change with real GraphQL calls
against the running server (introspection is enabled) where relevant. This is the
actual, established verification method used throughout this project's history —
not a gap to route around.

**Do not drive a browser to click-test frontend changes** — the user has said this
explicitly is not needed for any task in this repo, including new screens/UI work.
A clean `npm run build` in both `backend/` and `frontend/` (typecheck) is sufficient
before reporting UI work done; don't open the app in a browser to verify unless the
user asks for that specifically.

**No lint/format script wired up either** — `eslint`/`prettier` are devDependencies
but there's no config file or `npm run lint`/`format` script yet.

## Architecture

Strict one-directional layering, consistent across every feature:

```
GraphQL client -> Apollo Server (/graphql) -> Resolvers -> Validator.check() (Joi)
                                                  |
                                                  v
                                              Services (business logic)
                                                  |
                                                  v
                                    Repositories (extend BaseRepository<IT,RT>)
                                                  |
                                                  v
                                          Sequelize models -> PostgreSQL
```

- **Resolvers** parse args, call `requireAuth`/`requireOwner`, validate via
  `Validator.check(schema, input)`, delegate to a service, wrap the result in
  `SuccessResponse.send(...)`, translate thrown errors to `GraphQLError`. They never
  touch models or repositories directly.
- **Services** hold business logic/orchestration and own exactly one repository
  each. They return models/DTOs, not GraphQL-shaped envelopes. Resource-ownership
  checks belong here, next to the fetch that proves the resource exists (not in the
  resolver).
- **Repositories** are the only layer touching Sequelize. New repositories extend
  `BaseRepository<InputInterface, ModelInterface>` (`backend/src/repositories/baseRepository.ts`)
  and add only the query methods the generic repo can't express — don't reimplement
  `findByPk`/`create`/`updateOne`/etc.
- **Validators** are Joi schemas built from shared primitives in
  `backend/src/validators/schemas.ts`; every mutation input gets one, even a thin one.

Each domain feature (auth, place, category, review, session, ...) is a **vertical
slice** — one file per layer (migration, model, interface, repository, service,
validator, typeDefs, resolver), following the existing files as the template for a
new one. `backend/src/graphql/{typeDefs,resolvers}/index.ts` barrel-export each feature's
typedefs/resolver; `backend/src/graphql/schema/index.ts` composes them via `@apollo/subgraph`'s
`buildSubgraphSchema` (used purely for its "many files can each `extend type
Query`/`Mutation`" ergonomics — there's no federation gateway, this is a single
process).

**Auth**: JWT access+refresh tokens (`backend/src/utils/jwt.ts`). The Apollo context
function in `backend/src/server.ts` verifies the bearer token per request and attaches the
decoded payload as `context.user` (`AuthTokenPayload = {id, userType}` — not a full
user record). Three primitives in `backend/src/utils/auth.ts`:
- `requireAuth(context)` — must be logged in.
- `requireOwner(context)` — must be logged in *and* `userType === BUSINESS` (a
  **role** check, not resource ownership).
- `assertOwnership(actualOwnerId, requestingUserId, message)` — the actual
  resource-ownership check (e.g. "does this place belong to this caller"), called in
  the service layer after fetching the resource.

**Errors**: no custom error class — `throwError(message, code, status)`
(`backend/src/helpers/errorHelper.ts`) throws a `GraphQLError` with `extensions: {code,
status}`. Every resolver wraps its body in try/catch: rethrow `GraphQLError`s
as-is, coerce anything else (e.g. a raw Joi validation error) to `BAD_REQUEST`/400.

**Responses**: every resolver returns via the `SuccessResponse.send({message, data,
edges?, pageInfo?, count?})` singleton (`backend/src/helpers/responseHelper.ts`) — a
consistent envelope shape across the whole API.

**Data model conventions**: every table has `created_at`/`updated_at`/`deleted_at`
via Sequelize `paranoid: true` (soft delete — "delete" is reversible everywhere),
`underscored: true` with explicit `field:` mappings for camelCase↔snake_case, and
`freezeTableName: true`. Match this for any new table. Migrations are plain JS (not
TS) in `backend/src/migrations/`, named `<timestamp>-<kebab-case-description>.js`.

**Config**: `backend/src/config/index.ts` fails fast (`process.exit(1)`) on any missing
required env var via a `mustExist` helper — extend this rather than reading
`process.env` ad hoc elsewhere. `backend/src/config/instance.ts` holds a singleton Sequelize
connection (`Database.get()`).

Two user types drive authorization everywhere: `UserTypeEnum.REGULAR`/`BUSINESS`
(`backend/src/enums/userTypesEnum.ts`).

## Current feature surface

- **Auth**: signup/login, JWT issuance/refresh, session revocation — refresh tokens
  are hashed and persisted in `providers_sessions` (not just signed and trusted),
  rotated on refresh and revocable.
- **Places**: create/update/delete/getById, owner-gated writes.
- **Categories**: read-only browsing (`categories`, `category(id)`) — no mutations,
  categories are migration/seed-managed.
- **Reviews**: create/update/delete, one review per `(place, reviewer)` enforced by
  both a service-layer check and a DB unique index, self-review blocked.
  `Place.averageRating`/`reviewCount` are **recomputed from source** (`AVG`/`COUNT`
  over non-deleted reviews) inside the same transaction as any review write, never
  incrementally adjusted.

Review browsing/pagination, owner replies, and helpful-vote toggling are designed
(see `docs/04-roadmap.md` Phase 2 and, if present in your checkout, the untracked
`PHASE-2-REVIEWS-TICKETS.md`) but may not be present depending on which branch is
checked out — this repo develops each roadmap ticket on its own branch
(`rmp-<n>-ticket-<nn>-<slug>`, stacked on the previous ticket's branch) before
merging to `main`; check `git log --oneline` / `git branch` if the actual code
doesn't match what a doc describes.
