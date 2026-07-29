# Quality & Operations

This is the part of "excellent" that doesn't show up in a Figma file. Start the cheap
pieces of this now (Phase 1 of the roadmap), not after the product is "done."

## Testing

There are zero tests in the repo today. Suggested layers, cheapest-value-first:

1. **Service-layer unit tests** (Jest) — the business logic (ownership checks,
   average-rating recomputation, password hashing) lives in services; test it there
   without spinning up Apollo or a real DB, using a mocked repository.
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

A minimal GitHub Actions pipeline, added now, catches regressions for the rest of the
project's life for very little upfront cost:

```yaml
# .github/workflows/ci.yml (sketch)
on: [pull_request, push]
jobs:
  backend:
    steps:
      - checkout
      - setup-node
      - npm ci
      - npm run build        # tsc — catches type errors
      - npm test              # once tests exist
```

Add `npm run lint`/`npm run format:check` once ESLint/Prettier configs are actually
wired into `package.json` scripts (both are already devDependencies but there's no
lint/format script yet — quick win).

## Security

- **Ownership checks**: fix issue #2 in doc 2 before it's copy-pasted into
  review/reply resolvers.
- **Rate limiting**: `express-rate-limit` on `/graphql` at minimum; consider a
  query-cost/depth limiter (`graphql-query-complexity` or Apollo's built-in
  `costAnalysis` plugin) once the schema has nested list fields that could be abused.
- **Secrets**: `.env` is gitignored (verified) — keep it that way; `.env.example`
  documents required vars without values, which is the right pattern, keep it current
  as new config (S3 keys, session secret, etc.) gets added.
- **Refresh tokens**: persist a hash of them (Phase 1's `SESSIONS` table) so a leaked
  token can be revoked and "active sessions" is real, not decorative.
- **Password reset / forgot password**: implement with a short-lived, single-use,
  hashed token (not the raw token stored anywhere) — standard, but easy to get wrong,
  worth a deliberate look when Phase 1 builds `forgotPassword`/`confirmForgotPassword`.

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
