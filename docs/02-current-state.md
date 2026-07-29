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

## Known issues / tech debt worth fixing early

Cheaper to fix now, while there are only two features, than after ten more are built
on top of the same pattern.

1. **`authMeUser` is very likely broken.** [authResolver.ts](../src/graphql/resolvers/authResolver.ts:74)
   calls `new UserRepository().findByPk(user.id!)`, where `user = requireAuth(context)`.
   But `context.user` is populated in [server.ts](../src/server.ts:51) via
   `verifyJwt(token)`, which returns the raw JWT payload — `{ userid, userType, iat, exp }`
   (see [jwt.ts](../src/utils/jwt.ts:7)). There is no `id` field on that payload, only
   `userid`. So `user.id` is `undefined` and `authMeUser` will look up a bogus primary
   key. `placeResolver.createPlace` already works around this correctly by reading
   `user.userid` ([placeResolver.ts](../src/graphql/resolvers/placeResolver.ts:24)).
   Pick one field name (`id` is more conventional) and make the JWT payload, the
   `ContextInterface`, and every call site agree.

2. **`requireOwner` checks role, not resource ownership.** [auth.ts](../src/utils/auth.ts:19)
   confirms the caller's `userType === BUSINESS`, but `updatePlace` and `deletePlace`
   in [placeResolver.ts](../src/graphql/resolvers/placeResolver.ts:40-83) never check
   that the caller owns *that specific* place. Today, any business-type account can
   edit or delete any other business's listing. This needs an
   `existingPlace.ownerId === user.userid` check inside the service or resolver before
   the roadmap adds reviews/replies with the same shape of bug.

3. **Schema/resolver drift in auth.** [authTypedefs.ts](../src/graphql/typeDefs/authTypedefs.ts:92-98)
   declares `signOut`, `forgotPassword`, `changePassword`, `confirmForgotPassword` as
   mutations, but [authResolver.ts](../src/graphql/resolvers/authResolver.ts) only
   implements `signUp`, `login`, and the `authMeUser` query. Calling any of those four
   today will hit Apollo's default resolver and likely error or return `null`
   unexpectedly rather than a clear "not implemented." Either build them next (they're
   on the roadmap anyway — see doc 4) or remove them from the schema until they exist,
   so the schema is always truthful about what the API can do.

4. **`userTypedefs.ts` is dead and self-inconsistent.** [userTypedefs.ts](../src/graphql/typeDefs/userTypedefs.ts)
   defines `createUser`/`updateUser`/`deleteUser`/`users`/`user`, but it's never passed
   into `buildSubgraphSchema` in [schema/index.ts](../src/graphql/schema/index.ts) — so
   none of it is reachable. It also references a `SingleUser` type that is never
   defined anywhere in the file (would fail schema composition if it were wired in).
   Either delete this file or finish and wire it up as part of a proper user-management
   feature — leaving it as unreachable-and-broken is the worst of both options.

5. **No refresh-token persistence or revocation.** `signToken` issues a refresh JWT
   ([jwt.ts](../src/utils/jwt.ts:15)) but nothing stores it. There's no way to log a
   session out server-side, no "active sessions" list, and no way to satisfy the
   Settings screen's "active sessions with revoke" feature without a sessions table.

6. **Inconsistent GraphQL error `status` typing.** Some resolvers pass `status: 401`
   (number), others `status: "404"` (string) in `extensions`
   ([authResolver.ts](../src/graphql/resolvers/authResolver.ts:58) vs.
   [placeResolver.ts](../src/graphql/resolvers/placeResolver.ts:35)). Pick one type and
   enforce it — small thing, but it'll be copy-pasted into every future resolver if not
   caught now.

7. **No tests, no CI.** There is no test file anywhere in the repo and no
   `.github/workflows`. Covered in depth in
   [06-quality-and-ops.md](./06-quality-and-ops.md).

8. **Table naming is singular where the rest of the schema is plural.** `providers_category`
   vs. `providers_users`/`providers_places`/`providers_reviews`. Harmless functionally,
   but worth a single fixup migration before more code (and more developers) start
   referencing the name.

None of this blocks moving forward — it's a punch list to burn down alongside the
next couple of features, not a prerequisite for starting them.
