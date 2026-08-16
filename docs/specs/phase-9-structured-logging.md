# Phase 9 Spec: Structured Logging (pino)

**Status: ✅ Built and verified against a live server.** Second of Phase 9's
sequenced tickets, after [phase-9-testing-ci.md](./phase-9-testing-ci.md).

## Context

Doc 6 (`docs/06-quality-and-ops.md`) calls for "structured logging (pino) with a
request id threaded through resolver → service → repository, instead of the
current bare `console.log`/`console.error`." Nine `console.*` call sites existed
across the backend before this ticket, none tagged with any request context.

## What was built

**Base logger** (`backend/src/utils/logger.ts`) — a single process-wide `pino`
instance. Pretty-printed via `pino-pretty` outside production (readable during
`npm run start:dev`), raw JSON in production (the shape a log aggregator or
future Sentry/APM integration expects, per doc 6's Observability section). Level
defaults to `debug` outside production, `info` in it, overridable via `LOG_LEVEL`.
Configured with pino's standard `err` serializer so logged `Error`/`GraphQLError`
objects render as a formatted type/message/stack instead of an opaque object.

**Per-request logger + request id** (`backend/src/server.ts`) — `pino-http`
mounted globally (this app has no routes besides `/graphql`, so there was no
reason to scope it), wrapping every request including `rateLimiter`/`cors`/
`express.json()`:
- Generates a `crypto.randomUUID()` request id, or reuses an incoming
  `x-request-id` header if the request already has one (useful once this sits
  behind a reverse proxy that generates its own) - either way, echoes it back on
  the response so a client or proxy can correlate.
- Emits one access-log line per request (method/url/status/duration), auto-leveled
  via `customLogLevel`: `error` on 5xx or a thrown error, `warn` on 4xx, `info`
  otherwise.
- Custom `req`/`res` serializers - GraphQL requests carry auth tokens in headers
  and arbitrary user input in the body, so only `id`/`method`/`url` and
  `statusCode` are logged, never the raw request/response.

**Threading into GraphQL** — the Apollo context function (`server.ts`) now
returns `logger: req.log, requestId: req.id` alongside the existing `user`/`ip`/etc
fields, and `ContextInterface` (`backend/src/interfaces/contextInterface.ts`)
declares both (optional, so tests can build a `ContextInterface` without them).
Every resolver already receives `context` as its third argument, so
`context.logger` is available everywhere a resolver might want it - one log line
per request no longer means guessing which of N concurrent requests it came from.

**Resolver-layer logging via an Apollo plugin, not per-resolver edits**
(`backend/src/utils/apolloLoggingPlugin.ts`) — rather than adding log calls to
all 14 resolver files individually, one `ApolloServerPlugin` hooks
`requestDidStart`/`didEncounterErrors`/`willSendResponse` to log every GraphQL
operation's start (debug), completion with duration (info), and any errors
(error, including the thrown `GraphQLError`'s `code`/`status` extensions) -
uniformly, for every operation, tagged with the same request id via
`contextValue.logger`. This is what doc 6 meant by the "resolver" layer of the
thread-through chain.

**One concrete service-layer thread-through example** — `AuthService.forgotPassword`
now takes an optional second `context?: ContextInterface` param (matching the
shape `signUp`/`login` already take, just previously omitted here) and uses
`context?.logger ?? logger` for its existing dev-only "here's the reset code,
no email provider is wired up yet" log line. `authResolver.ts`'s `forgotPassword`
resolver passes its own `context` through. Covered by a new test in
`authService.test.ts` asserting the request-scoped logger (not the base one) is
called when a context is provided.

**Every other pre-existing `console.*` call site swapped to the pino logger**
(the base one - none of these run inside a request):
`server.ts` (boot message, DB-connect failure), `config/instance.ts` (DB
authenticate success/failure), `jobs/trendingScoreJob.ts` (the cron job's two
failure-catch logs).

## Deliberately left out of this ticket

- **Not threading a logger through every service/repository method.** Doc 6's
  phrasing ("resolver → service → repository") reads like every layer should
  take a logger, but auditing the codebase found nothing else that actually logs
  anything today - `forgotPassword`'s dev-only line above was the only
  non-boot, non-cron log call site inside the service layer. Adding a `logger`
  param to every method across 15 services and their repositories on spec, with
  nothing yet to log there, would be exactly the kind of speculative
  infrastructure the root `CLAUDE.md` says not to build. The `context.logger`
  plumbing is in place (`ContextInterface`, the Apollo context function, and one
  worked example in `authService`) so the next place that needs to log something
  service-side has a real, already-proven pattern to follow - it just doesn't
  need retrofitting everywhere pre-emptively.
- **`config/index.ts`'s `mustExist` guard keeps `console.error`, deliberately.**
  It runs at module-load time, before any logger/request context exists, and
  immediately calls `process.exit(1)`. Dev's `pino-pretty` transport writes via a
  worker thread, which isn't guaranteed to flush before the process exits;
  `console.error` to stderr is synchronous and always flushes first. Getting this
  one wrong would mean a dev sees the process exit with no explanation of why -
  worse than being technically inconsistent. Documented inline at the call site.
- **Sentry/error tracking** - doc 6 gates this on there being a real deployed
  environment, which doesn't exist yet (see the Deployment item still open on
  `docs/04-roadmap.md`'s Phase 9 checklist).
- **Log shipping/aggregation** (e.g. to a hosted log service) - no deployed
  environment to ship from yet, same as above.

## Verification

`npm run build` and `npm test` (44/44, one new test for the `forgotPassword`
logger thread-through) both clean in `backend/`. Live-verified against the
already-running `npm run start:dev` server (nodemon picked up the change
automatically): confirmed a real request gets an `x-request-id` response header
(fresh UUID, or the caller's own value echoed back when one is sent); confirmed
the access log, the per-operation start/complete logs, and the
`didEncounterErrors` error log (with `code`/`status`/formatted stack) all appear
tagged with the same request id for a single request, including a real GraphQL
validation error triggered on purpose.
