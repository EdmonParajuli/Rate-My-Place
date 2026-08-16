# Phase 9 Spec: Service-Layer Unit Tests + CI

**Status: ✅ Jest + ts-jest wired up, ✅ 43 service-layer unit tests, ✅ GitHub Actions
CI running build+test on both `backend/` and `frontend/`.** First of Phase 9's
sequenced tickets — doc 6's testing layers 2/3 (repository/integration tests against a
real Postgres, resolver/GraphQL tests) and the rest of Phase 9 (query-cost limiting,
structured logging, error tracking, deployment, load testing) are still open; see
`docs/04-roadmap.md`'s Phase 9 checklist.

## Context

Phase 9 was un-sequenced in the roadmap ("not really sequential ... start doc 6's
testing/CI recommendations as early as Phase 1, don't save all of it for the end"),
but nothing had actually landed — zero tests existed anywhere in the repo, no
`npm test` script, no CI. Doc 6 (`docs/06-quality-and-ops.md`) lays out four testing
layers, cheapest-value-first; this ticket builds the first ("service-layer unit tests
... using a mocked repository") plus the CI pipeline that runs them, since a test
suite nobody runs automatically decays fast.

Rate limiting (`express-rate-limit` on `/graphql`, `backend/src/middlewares/rateLimiter.ts`)
and the password-reset flow (short-lived hashed token, `AuthService.forgotPassword`/
`confirmForgotPassword`) — two other items doc 6 calls out under Security — turned out
to already be built (from earlier in the project, opportunistically per doc 6's "start
early" note), just never checked off on the Phase 9 roadmap entry. Docs-synced
alongside this ticket's real work.

## What was built

**Jest + ts-jest** (`backend/jest.config.js`, `backend/tests/setupEnv.ts`):
- Tests live in `backend/tests/`, mirroring `src/`'s shape, entirely outside `src/`
  so `tsc`'s `rootDir: "./src"` build is unaffected.
- `setupEnv.ts` (a Jest `setupFiles` entry, so it runs before any test module
  imports app code) sets dummy values for every env var `src/config/index.ts`'s
  `mustExist()` guards require — without this, merely importing a service through
  `../config` would `process.exit(1)` under test. `dotenv.config()`'s calls
  elsewhere in the app don't override already-set vars, so the real local `.env`
  never leaks into the test process for these keys.
- `PASSWORD_HASH_CONSTANT` is set low (4) in test env — `authService.test.ts` hashes
  real passwords with real `bcrypt` rather than mocking it, and production's cost
  factor would make that noticeably slower for no added test value.
- `tsconfig`'s `types` is overridden to add `"jest"` inside `jest.config.js`'s
  `transform` options rather than in the root `tsconfig.json`, so Jest globals
  (`describe`/`it`/`expect`) don't leak into the `tsc` production build's type
  environment.

**Test files and what they cover** (`backend/tests/`):
- `services/businessDashboardMath.test.ts` — pure functions, no mocking needed.
  `computeReputationScore`'s weighting/log-scale diminishing-returns behavior;
  `computeDashboardStats`'s trend deltas (computed against a last-month snapshot,
  not live numbers), response-rate calculation, sentiment bucketing, the insights
  priority list (including the empty-state and steady-state fallback messages), and
  the 12-month null-filled bucket shape.
- `utils/auth.test.ts` — `requireAuth`/`requireOwner`/`assertOwnership`, including
  the string/number id-coercion behavior `assertOwnership` relies on everywhere it's
  called from services.
- `services/authService.test.ts` — mocked `UserRepository`/`PasswordResetTokenRepository`/
  `SessionService` (via `jest.mock(path)` automock — safe here since neither
  repository's real module graph pulls in Sequelize models, unlike `reviewService`'s
  case below). Covers duplicate-email signup rejection, real bcrypt hash-and-verify
  round-tripping, login success/wrong-password/unknown-email, change-password's
  previous-password check and session-revocation side effect, forgot-password's
  intentional no-op-for-unknown-email (doesn't leak account existence), and
  confirm-forgot-password's invalid/expired-code rejection plus the success path's
  token-consumption + full session revocation.
- `services/reviewService.test.ts` — `createReview`'s self-review block, duplicate-review
  block, successful-create rating recomputation (`getRatingStats` → `updateRatingStats`,
  same transaction), the notify-owner + notify-watchers (savers ∪ past reviewers, minus
  the reviewer and owner) side effects, and a transaction-rollback test (repository
  `create` rejects → `commit` never called, `rollback` called, place stats untouched).
  `updateReview`/`deleteReview`'s not-found and ownership-check paths, plus
  `updateReview`'s partial-field-update + recompute + post-commit re-fetch.

**Why `reviewService.test.ts` needed factory mocks, not automocks:** `jest.mock(path)`
without a factory still `require()`s the real module once to learn its shape.
`ReviewRepository`'s real module imports `src/models/index.ts`, which calls
`sequelize.define(...)` on the real `Database` singleton at import time — and since
this test also needs to mock `../config` (to stub `Database.sequelize.transaction`
so `withTransaction` doesn't try to open a real Postgres connection), the automock's
shape-inspection pass hit the *mocked* `Database` object, which has no `.define`, and
crashed the whole suite (`TypeError: sequelize.define is not a function`). Switched
`ReviewRepository`, `PlaceService`, `NotificationService`, and `SavedPlaceService` to
explicit `jest.mock(path, factory)` calls that return plain objects of `jest.fn()`s
directly — the real modules (and their imports) never execute at all. Each test's
`beforeEach` grabs the specific mock instance a fresh `ReviewService()` constructed via
`mockedConstructor.mock.results[...].value`, since the factory returns a new object
per `new X()` call rather than sharing methods on a prototype the way automock does.

**CI** (`.github/workflows/ci.yml`): two independent jobs (matching the two
independent `package.json`s, no npm workspaces), each `working-directory`-scoped —
`backend` runs `npm ci` → `npm run build` (tsc) → `npm test` (jest); `frontend` runs
`npm ci` → `npm run build` (`tsc -b && vite build`). Triggers on push to `main` and on
every pull request. Node 22 via `actions/setup-node`, with npm's dependency cache
keyed off each directory's own lockfile.

## Deliberately left out of this ticket

- **`npm run lint` in CI for `frontend/`.** `frontend/package.json` already has a
  real `lint` script (`oxlint`), but it's currently broken in this checkout's local
  `node_modules` — `oxlint@1.78.0` requires Node `>=22.12.0`, this machine runs
  `22.11.0`, and the platform-specific native binding (`@oxlint/binding-darwin-arm64`)
  didn't get installed as a result. `npm run build` doesn't hit this (Vite only
  warns about the Node version, doesn't fail), so it wasn't blocking, but since lint
  couldn't be verified to pass locally, it wasn't wired into CI on faith — CI's Node
  22 (a current patch, satisfying `>=22.12.0`) would likely not hit this at all, but
  that's a guess, not a verified fact. Worth revisiting: either bump local Node, or
  just add the CI step and let a real CI run confirm it.
- **Backend lint/format.** Root `CLAUDE.md` already documents this as not wired up
  (`eslint`/`prettier` are devDependencies with no config file or script yet) —
  unchanged by this ticket, not this ticket's scope.
- **Doc 6 testing layers 2 and 3** (repository/integration tests against a real,
  containerized Postgres; resolver/GraphQL tests against the live schema) — layer 1
  (service-layer, mocked-repository unit tests) was the explicitly cheapest-value
  starting point; layers 2/3 need a disposable-Postgres `docker-compose` setup this
  ticket doesn't build.
- **Frontend tests** (doc 6's "component tests ... Playwright for critical paths") —
  backend-only ticket; this repo's established convention (root `CLAUDE.md`) is that
  frontend correctness is verified via typecheck + real GraphQL calls, not a browser
  test harness, and that hasn't been revisited here.

## Verification

`npm run build` (tsc) and `npm test` (43/43 passing) both clean in `backend/`;
`npm run build` clean in `frontend/`. CI workflow YAML is written to mirror these same
commands exactly, so a green CI run is the same signal as this local verification —
not independently re-verified by actually pushing and watching a GitHub Actions run
complete, since that requires the push this ticket's own workflow doesn't own.
