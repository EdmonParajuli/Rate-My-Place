# Phase 9 Spec: Query Cost/Depth Limiting

**Status: ✅ Built and verified against a live server.** Fourth of Phase 9's
sequenced tickets, after
[phase-9-integration-tests.md](./phase-9-integration-tests.md).

## Context

Doc 6 (`docs/06-quality-and-ops.md`) flags query-cost/depth limiting as needed
"once the schema has nested list fields that could be abused" — `listPlaces`
(the first fully public, caller-controlled, filterable list endpoint, per
[phase-3-discovery.md](./phase-3-discovery.md)'s open question) is exactly
that point.

**What was already safe**: every paginated field (`listPlaces`, `placeReviews`,
`myReviews`) goes through `CursorBasedPagination.validateParameters`
(`src/packages/cursors/service/cursorBasedPagination.ts`), which clamps
`limit: Math.min(first || MinLimit, MaxLimit)` — 10 to 1000 rows, regardless
of what a client passes for `first`. Row-count-per-field abuse was already
bounded before this ticket.

**What wasn't**: several `Place`/`Review` fields resolve with a live,
per-parent-row DB lookup — `Place.owner`/`category`/`hours`/`openNow`/
`ratingBreakdown`/`photos`/`savedByMe`/`savedListType` and
`Review.reviewer`/`place`/`reply`/`helpfulByMe`/`photos` all call a service
once per row, not once per query (confirmed by reading every one of their
resolvers in `placeResolver.ts`, `reviewResolver.ts`,
`reviewReplyResolver.ts`, `reviewVoteResolver.ts`, `mediaResolver.ts`,
`savedPlaceResolver.ts`). Nothing stopped a client from combining a
near-max `first` with several of these in one request — e.g.
`listPlaces(first: 1000) { data { owner { id } category { id } photos { id }
} }` forces on the order of 3000 extra DB round trips in a single HTTP
request, independent of the already-enforced row cap.

## What was built

**`graphql-query-complexity`** (the option doc 6 names; Apollo Server v4 has
no free built-in cost-analysis plugin, so the "Apollo's `costAnalysis`
plugin" alternative doc 6 also named isn't actually available), wired in as
an Apollo Server plugin (`src/utils/queryComplexityPlugin.ts`), not a static
`validationRules` entry — the package's `variables` option needs the
request's actual resolved variables (e.g. `listPlaces(first: $n)`), which
only exist once Apollo has parsed the request, not at server-startup when
`validationRules` would be constructed once for every request.

**`@complexity` directive** (`commonTypedefs.ts`, declared once since every
feature's typeDefs composes into one schema) —
`directive @complexity(value: Int!, multipliers: [String]) on FIELD_DEFINITION`,
read via `graphql-query-complexity`'s `directiveEstimator()`. Applied to:
- The three paginated Query root fields — `@complexity(value: 1,
  multipliers: ["first"])` — so a field's own cost plus everything selected
  under it multiplies by the actual page size requested, including when
  `first` arrives as a GraphQL variable rather than an inline literal
  (verified in the test below).
- Every live per-row field named above — a flat `@complexity(value: 2)` each.
  No multiplier needed on these: they're nested *under* a paginated field, so
  the parent's `first`-multiplier already multiplies their cost as part of
  `childComplexity` — e.g. `listPlaces(first: 50) { data { photos { ... } } }`
  costs roughly `(1 + 2 + ...) * 50`, correctly reflecting 50 extra `photos`
  lookups, not a flat 2.
- Every other field defaults to `simpleEstimator({ defaultComplexity: 1 })`
  (the fallback estimator, tried after `directiveEstimator` per field).

**The plugin** (`didResolveOperation`, same lifecycle hook
[phase-9-structured-logging.md](./phase-9-structured-logging.md)'s Apollo
plugin uses) calls `getComplexity({ schema, query: document, variables,
operationName, estimators })` once per request and `throwError`s
(`QUERY_TOO_COMPLEX`, 400 — same `throwError`/`GraphQLError` convention every
other resolver error uses) if the result exceeds `queryComplexityLimit`.

**`queryComplexityLimit`** (`src/config/index.ts`) — `Number(process.env.
QUERY_COMPLEXITY_LIMIT) || 2000`, optional (not one of `config/index.ts`'s
`mustExist`-guarded required vars, so every existing `.env` keeps working
unmodified). 2000 was calibrated by measuring real shapes: a typical Discover
page (`listPlaces(first: 12)` plus a few nested live fields like
`category`/`openNow`/`savedByMe`) scores in the low hundreds; the same shape
at the pagination layer's own max page size (`first: 1000`) scores in the
tens of thousands — see the unit test below for the exact numbers. 2000
leaves generous headroom above any real screen's current query shape while
still rejecting near-max-page-size abuse.

## Verification

`backend/tests/utils/queryComplexity.test.ts` (3 new tests, run against the
real composed schema, not a mock) — a typical Discover-shaped query scores
well under the limit, a `first: 1000` query stacking several live fields
scores well over it (28000 vs. the 2000 limit), and complexity scales
correctly when `first` is passed as a variable rather than inlined. `npm
test` (47/47) and `npm run build` both clean.

Live-verified against the running dev server: the same `first: 1000` +
stacked-live-fields shape from the test above, sent as a real HTTP request,
is rejected before any resolver runs —
`{"errors":[{"message":"Query is too complex: 28000. Maximum allowed
complexity: 2000.","extensions":{"code":"QUERY_TOO_COMPLEX","status":400}}]}`
— while a normal `listPlaces(first: 12)` request and a normal
`placeReviews(placeId, first: 10)` request (mirroring what the frontend
actually sends) both succeed unchanged.

## Deliberately left out of this ticket

- **Query depth limiting.** This schema doesn't have the kind of cyclic
  type recursion (e.g. `User { reviews { place { reviews { ... } } } }`)
  that makes pure depth-bombing a distinct risk from cost-bombing here — the
  live-field cost annotations above already cover the schema's actual
  nested-list abuse surface. Worth revisiting if a future feature adds a
  genuinely recursive relationship.
- **Per-user/tiered limits** (e.g. a higher ceiling for authenticated
  business accounts). One global `queryComplexityLimit` matches doc 6's ask;
  no signal yet that different callers need different budgets.
- **Introspection-query allowlisting.** Not needed in practice — introspection
  queries only touch `__schema`/`__type` meta-fields, which fall through to
  the default `simpleEstimator` (cost 1 each) and never touch the annotated,
  `first`-multiplied fields, so they stay cheap regardless of schema size.
