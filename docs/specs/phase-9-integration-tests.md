# Phase 9 Spec: Repository/Integration Tests

**Status: ✅ Built and verified.** Third of Phase 9's sequenced tickets, after
[phase-9-testing-ci.md](./phase-9-testing-ci.md) (layer 1, mocked-repository unit
tests) and [phase-9-structured-logging.md](./phase-9-structured-logging.md).

## Context

Doc 6 (`docs/06-quality-and-ops.md`) calls this "layer 2" of the testing pyramid:
tests against a real, disposable Postgres that verify the Sequelize models,
migrations, and `BaseRepository` methods actually work together — the class of bug
a mocked-repository unit test structurally cannot catch (SQL that doesn't compile,
constraints that don't fire, transaction-visibility issues).

## What was built

**A dedicated test database**, never the dev DB. `backend/docker-compose.yml` (new)
defines a throwaway `postgres:16-alpine` service (`test_user`/`test_password`/
`rate_my_place_test`, port 5433) for CI and any machine with Docker available.
Locally in this environment, Docker isn't installed — `.env.test.example` documents
both paths: `docker compose up -d` then copy as-is, or point `DB_*` at a
differently-named database (`rate_my_place_test`) on whatever local Postgres is
already running. Either way, `backend/.env.test` (gitignored, like `.env`) holds the
real values; `src/config/database.js` now loads `.env.test` instead of `.env` when
`NODE_ENV=test` (used by `sequelize-cli` for migrations), and
`tests/integration/setupEnv.ts` loads the same file as a Jest `setupFiles` entry so
`src/config/index.ts` connects to the test DB instead of dev before any app code
imports it.

**A separate Jest config** (`backend/jest.integration.config.js`) — its own
`testMatch` (`tests/integration/**/*.test.ts`), `setupFiles` for `.env.test`, and a
`globalTeardown` (`tests/integration/globalTeardown.js`) that closes the shared
Sequelize connection once, after every test file finishes (not a per-file
`afterAll` — under `--runInBand`, all test files share one process/module registry,
so a per-file teardown closes the connection out from under whichever file runs
next). `jest.config.js` (the unit config) now excludes
`tests/integration/` via `testPathIgnorePatterns` so the two suites never cross.
New npm scripts: `db:migrate:test`/`db:migrate:test:undo:all` (migrate the test DB,
`NODE_ENV=test`), `pretest:integration` (runs the migrate automatically), and
`test:integration` (`jest --config jest.integration.config.js --runInBand
--forceExit`) — serial, so concurrent test files don't race on shared tables via
`truncateAll()`; `--forceExit` because Jest's own open-handle detection flags the
Postgres connection pool as a lingering handle even after `globalTeardown` closes
it cleanly (cosmetic warning, not a real leak — confirmed via `--detectOpenHandles`).

**Test helpers** (`backend/tests/integration/helpers.ts`) — `truncateAll()` (see Errors
below for why this is a raw `TRUNCATE`, not `sequelize.truncate()`) plus
`createTestUser`/`createTestCategory`/`createTestPlace` factories, called at the top
of each test to get a clean, isolated slate.

**Two test files, 7 tests**, chosen for what they can catch that layer 1 (mocked)
couldn't:
- `baseRepository.test.ts` — CRUD, paranoid soft-delete + restore, and a
  transaction-visibility regression test (see below) against a real repository
  (`CategoryRepository`, standing in for the shared `BaseRepository` every other
  repository extends).
- `reviewRepository.test.ts` — the DB-level unique constraint on `(place_id,
  reviewer_id)` actually rejects a duplicate at the database layer (not just the
  service-layer check); a soft-delete-then-recreate regression test (below); and
  `getRatingStats` against real `AVG`/`COUNT` SQL, including that soft-deleted
  reviews are excluded.

## Two real bugs found and fixed

Both were latent in ways the existing dev workflow could never surface, and both
are now locked in as regression tests so they can't silently come back.

1. **Migration ordering bug.** `create-places-table`'s migration ran before
   `create-category-table` but declared an inline Sequelize `references` for
   `category_id` pointing at the not-yet-existing category table. This dev DB was
   never migrated from empty — it was built up incrementally as each migration
   landed — so the bug was invisible until integration testing replayed every
   migration from scratch on a fresh database, which failed immediately. Fixed by
   dropping the inline `references` from `create-places-table` and adding the FK as
   an explicit `addConstraint`/`removeConstraint` pair inside
   `create-category-table`'s `up()`/`down()`, after the category table actually
   exists.
2. **`sequelize.truncate()` silently truncates nothing.** The first version of
   `truncateAll()` used Sequelize's own `sequelize.truncate({cascade: true,
   restartIdentity: true})` convenience method. It resolves without error but
   truncates zero tables in this project's setup: it iterates
   `sequelize.modelManager.models`, an internal array that was empty, even though
   `sequelize.models` — the public, correctly-populated registry — has all 14
   models. This let stale data accumulate silently across test runs, eventually
   surfacing as a confusing blank-message `SequelizeUniqueConstraintError` on a
   duplicate email from a prior run's leftover row. Fixed by rewriting
   `truncateAll()` as a single raw `TRUNCATE TABLE ... RESTART IDENTITY CASCADE`,
   built from `Object.values(sequelize.models)` so it stays in sync automatically
   as models are added.

These bugs also motivated the two regression tests worth calling out explicitly:
- **Transaction-visibility regression** (`baseRepository.test.ts`) — a write inside
  an uncommitted transaction must be visible to a read using that same transaction,
  and must *not* be visible to a concurrent read outside it. This is the same class
  of bug flagged as a known issue from Phase 8 in `docs/02-current-state.md`; a
  mocked repository can't exercise real transaction isolation at all.
- **Soft-delete-then-recreate regression** (`reviewRepository.test.ts`) — after
  soft-deleting a review, the same reviewer must be able to review the same place
  again, and the partial-unique-index behavior (unique on `(place_id, reviewer_id)`
  only where `deleted_at IS NULL`) must actually hold at the database level, per the
  partial-unique-index issue noted earlier in this project's history.

## CI

`.github/workflows/ci.yml` gained a third job, `backend-integration`, alongside the
existing `backend` (build + unit tests) and `frontend` (build) jobs. Uses GitHub
Actions' native `services:` block for a `postgres:16-alpine` container (not
`docker-compose.yml`, which stays as local/portability reference only) with a
`pg_isready` health check gating the job's steps, `DB_*` env vars pointing at it,
and dummy values for the other `mustExist`-guarded config (`PORT`,
`CLOUDINARY_NAME`, `API_KEY`, `API_SECRET`, `JWT_*`) — same convention as
`.env.test.example`. Runs `npm run test:integration`, which migrates the test DB
(`pretest:integration`) and then runs the suite, on every push to `main` and every
pull request.

## Deliberately left out of this ticket

- **Resolver/GraphQL tests (doc 6 layer 3).** Still open — a separate ticket.
- **Frontend tests.** Still open, per doc 6's layer 4.
- **Seeding/fixture factories beyond the three helpers above.** Only what the
  current two test files needed; add more as new integration tests need them,
  rather than building out a speculative fixture library now.

## Verification

`npm run test:integration` (7/7 passing, migrations apply cleanly from an empty
test DB, Jest exits via `--forceExit` after the cosmetic open-handle warning),
`npm test` (44/44, unaffected), `npm run build` in both `backend/` and `frontend/`
all clean. CI workflow YAML validated for syntax; the new job's env/service
wiring mirrors the already-proven local `.env.test` setup.
