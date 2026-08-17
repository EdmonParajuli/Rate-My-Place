# Phase 9 Spec: Resolver/GraphQL Tests

**Status: ✅ Built and verified.** Fifth of Phase 9's sequenced tickets, after
[phase-9-query-complexity.md](./phase-9-query-complexity.md).

## Context

Doc 6 (`docs/06-quality-and-ops.md`) names this "layer 3" of the testing
pyramid: "execute real GraphQL operations against the schema with a test
context (mock `ContextInterface.user`) to catch schema/resolver drift like
the `signOut`/`forgotPassword` gap found in doc 2." That historical bug
(`docs/02-current-state.md`'s issue 3) was `signOut`/`forgotPassword`/
`changePassword`/`confirmForgotPassword` declared in the schema's typeDefs
but never wired into the resolver map at all — a class of bug neither layer 1
(mocked-service unit tests, which never touch the schema) nor layer 2
(repository/Postgres integration tests, which never touch GraphQL execution
at all) can catch, since both bypass the resolver layer entirely.

## What was built

**`backend/tests/resolvers/helpers.ts`** — a small shared harness:
`execute(source, { variableValues, context })` runs `graphql()` (the
`graphql` package's top-level parse+validate+execute helper) against the
real, fully composed `schema` from `src/graphql/schema` — the exact same
schema object Apollo Server runs in production, not a rebuilt or partial
stand-in. `contextAs(id, userType)` builds a minimal authenticated
`ContextInterface`; `firstError()` is a small assertion helper.

**Only repositories are mocked** (same `jest.mock(path)` automock pattern
`tests/services/authService.test.ts` already established) — everything above
that layer runs for real: the resolver's `requireAuth`/`requireOwner`
checks, `Validator.check()`'s Joi validation, the service's business logic,
`assertOwnership`, and `SuccessResponse.send()`'s envelope shaping. This is
the deliberate difference from layer 1: layer 1 mocks the *service* a
resolver calls (to unit-test that service in isolation); layer 3 mocks only
the *repository* underneath a real service, so the GraphQL contract itself
— schema wiring, auth enforcement, validation-error shape — is what's under
test.

**18 tests across three files**, chosen for the "auth, ownership checks"
paths doc 6 names explicitly, plus the specific regression class described
above:

- `authResolver.test.ts` (7 tests) — `login` (valid credentials, unregistered
  email, malformed input rejected by Joi before the repository is ever
  called), `authMeUser` (authenticated success, and an unauthenticated
  caller rejected — the same query/mutation shape as the original doc 2 bug),
  `signOut` (a direct regression test for doc 2's issue 3: authenticated
  caller gets a real "Signed out successfully" response and the session
  repository is actually called with the right arguments, not silently a
  no-op).
- `placeResolver.test.ts` (6 tests) — `createPlace` (BUSINESS caller
  succeeds, REGULAR caller rejected via `requireOwner`, unauthenticated
  rejected, invalid input rejected by Joi), `updatePlace` (a BUSINESS caller
  who doesn't own the place rejected via `assertOwnership` — the exact bug
  class doc 2's issue 2 was, "`requireOwner` checks role, not resource
  ownership" — and the owning caller succeeding).
- `reviewResolver.test.ts` (5 tests) — `createReview`: unauthenticated
  rejected, self-review rejected, duplicate review rejected, out-of-range
  rating rejected by Joi, and reviewing a nonexistent place rejected.
  Deliberately doesn't cover the successful-creation path (which runs inside
  a real Sequelize transaction via `Database.sequelize.transaction()`) —
  that's already thoroughly covered, including rollback behavior, by
  `tests/services/reviewService.test.ts`'s layer-1 tests; re-testing it here
  would mean mocking the same transaction machinery a second time for no
  new coverage.

**A real bug in the test-writing process, not the app**: the first pass at
these tests used string ids (`"user-1"`) for mocked `User`/`Place` model
data, which passed at the service-mock layer (layer 1 already does this) but
failed here with `GraphQLError: Int cannot represent non-integer value` —
`User.id`/`Place.id` are `Int` in the schema. Real GraphQL execution catches
this kind of fixture/schema mismatch that a service-level unit test
structurally can't, which is exactly the point of this layer.

## Deliberately left out of this ticket

- **Exhaustive per-resolver coverage.** 14 resolver files exist; this ticket
  covers 3, chosen for doc 6's explicit "auth, ownership checks" priority and
  the concrete historical regression it names. Don't chase 100% coverage,
  per doc 6's own guidance.
- **Query/list resolver tests** (`listPlaces`, `placeReviews`, pagination
  shape, `@complexity` interaction) — layer 2's integration tests already
  exercise the real pagination/repository behavior; a resolver-level test
  here would mostly re-verify wiring already covered by
  [phase-9-query-complexity.md](./phase-9-query-complexity.md)'s own tests
  (which also execute against the real schema).
- **Frontend tests** (doc 6 layer 4) — still open, tracked separately.

## Verification

`npm test` — 65/65 passing (47 previous + 18 new). `npm run build` clean.
