# Quality & Operations

This is the part of "excellent" that doesn't show up in a Figma file. Start the cheap
pieces of this now (Phase 1 of the roadmap), not after the product is "done."

## Testing

**Layer 1 built (2026-08-16, Phase 9)** — see
[specs/phase-9-testing-ci.md](./specs/phase-9-testing-ci.md). Layers 2-4 below are
still open. Suggested layers, cheapest-value-first:

1. **Service-layer unit tests** (Jest) — the business logic (ownership checks,
   average-rating recomputation, password hashing) lives in services; test it there
   without spinning up Apollo or a real DB, using a mocked repository. **Built**:
   `backend/tests/` (Jest + ts-jest), 43 tests covering `businessDashboardMath`,
   `utils/auth`, `authService`, `reviewService`.
2. **Repository/integration tests** against a real (containerized, throwaway)
   Postgres — verifies the Sequelize models, migrations, and `BaseRepository` methods
   actually work together. Use `docker-compose` to spin up a disposable test DB.
3. **Resolver/GraphQL tests** — execute real GraphQL operations against the schema
   with a test context (mock `ContextInterface.user`) to catch schema/resolver drift
   like the `signOut`/`forgotPassword` gap found in doc 2.
4. **Frontend**: component tests for interactive components, Playwright for the
   critical end-to-end paths (see doc 5).

Don't chase 100% coverage — prioritize the paths with money/trust on the line:
auth, ownership checks, rating aggregation, payment/upgrade flow if that ships.

## CI/CD

**Built (2026-08-16, Phase 9)** — `.github/workflows/ci.yml`: two jobs (`backend`,
`frontend`, matching the two independent `package.json`s), each `npm ci` → `npm run
build`, `backend` additionally running `npm test`. Triggers on push to `main` and
every pull request.

Still open: `frontend/package.json` already has a real `lint` script (`oxlint`), but
it's untested in CI (see the ticket spec for why — a local Node-version mismatch
means it couldn't be verified to pass before wiring it in). Add `npm run
lint`/`npm run format:check` for `backend/` once ESLint/Prettier configs are actually
wired into `package.json` scripts there (both are already devDependencies but
there's no lint/format script yet — quick win).

## Security

- **Ownership checks**: fix issue #2 in doc 2 before it's copy-pasted into
  review/reply resolvers.
- **Rate limiting**: `express-rate-limit` on `/graphql` at minimum. **Built** —
  `backend/src/middlewares/rateLimiter.ts`, wired into `server.ts`. Still open:
  a query-cost/depth limiter (`graphql-query-complexity` or Apollo's built-in
  `costAnalysis` plugin) once the schema has nested list fields that could be abused.
- **Secrets**: `.env` is gitignored (verified) — keep it that way; `.env.example`
  documents required vars without values, which is the right pattern, keep it current
  as new config (S3 keys, session secret, etc.) gets added.
- **Refresh tokens**: persist a hash of them (Phase 1's `SESSIONS` table) so a leaked
  token can be revoked and "active sessions" is real, not decorative. **Built**
  (Phase 1) — `providers_sessions`, `SessionService`.
- **Password reset / forgot password**: implement with a short-lived, single-use,
  hashed token (not the raw token stored anywhere) — standard, but easy to get wrong,
  worth a deliberate look when Phase 1 builds `forgotPassword`/`confirmForgotPassword`.
  **Built** — `AuthService.forgotPassword`/`confirmForgotPassword`, a hashed
  `codeHash` + `expiresAt` on `PasswordResetTokenRepository`, single-use via
  `usedAt`.

## Observability

- Structured logging (pino) with a request id threaded through resolver → service →
  repository, instead of the current bare `console.log`/`console.error`.
- Error tracking (Sentry or similar) once there's a deployed environment — the
  GraphQL error extensions already carry a `code`/`status`, which maps cleanly onto
  most APM tools' error grouping.

## Deployment

- **Local dev**: `docker-compose` for Postgres (the app itself already runs via
  `nodemon`/`ts-node`) — removes "works on my machine" DB version drift.
- **Hosting**: any of Railway/Render/Fly.io are a reasonable, low-ops fit for a
  Node + Postgres app at this stage; a bigger AWS/GCP setup is premature until there's
  a reason (compliance, scale) to need it.
- **Migrations in deploy**: run `sequelize-cli db:migrate` as an explicit deploy step,
  never as a side effect of app boot — keeps schema changes auditable and rollback-able
  independent of app deploys.

## Media/storage (ties to roadmap Phase 8)

Whichever object storage provider gets picked (S3, Cloudinary, Supabase Storage), the
upload pattern should be **signed upload URLs from the backend, direct browser→storage
upload** — not routing file bytes through the GraphQL server. This keeps the Apollo
server stateless and avoids a whole class of upload-size/timeout problems.
