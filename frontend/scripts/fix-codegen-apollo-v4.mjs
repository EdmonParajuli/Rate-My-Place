// Two places where typescript-react-apollo@4.4.2's generated code doesn't
// compile against Apollo Client v4's actual types - both are gaps in the
// plugin's current v4 support (last updated for v3's shape), not project
// bugs, and neither has a plugin config toggle. This file regenerates on
// every `npm run codegen`, so both fixes run as a post-codegen step rather
// than one-off hand edits.
import { readFileSync, writeFileSync } from "node:fs"

const path = "src/lib/graphql/generated/graphql.ts"
let source = readFileSync(path, "utf8")

// Fix 1: useXSuspenseQuery's second (SkipToken) overload doesn't type-check
// against v4's actual useSuspenseQuery types. The plugin already anticipates
// some drift (a `// @ts-ignore` before the first overload, generated
// unconditionally by its own template) but not this one (TS2394).
const brokenSuspenseOverload =
  /^(export function use\w+SuspenseQuery\(baseOptions\?: .*SkipToken \| .*SuspenseQueryHookOptions<.*>\): .*UseSuspenseQueryResult<.* \| undefined,.*>;)$/gm

source = source.replace(
  brokenSuspenseOverload,
  "// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-apollo-v4.mjs\n$1"
)

// Fix 2: for any query with an all-required variables object (e.g. `Category
// Query($id: Int!)`), the plugin generates an outer wrapper signature that
// requires `variables` (via an intersection with `{ variables: V; skip?:
// boolean } | { skip: boolean }`), then internally calls
// `ApolloReactHooks.useQuery<T, V>(Document, options)` where `options` is
// built via `{...defaultOptions, ...baseOptions}`. Apollo Client v4's real
// `useQuery` enforces required variables through its own overload set
// instead, which that spread's inferred `variables?: V | undefined` type
// never satisfies (TS2769) regardless of what the outer signature promises.
// The outer signature (what callers actually see and get checked against)
// is unaffected either way, since V itself still correctly requires the
// field - only this internal call needs the assertion, and applying it
// unconditionally to every internal useQuery/useLazyQuery/useSuspenseQuery
// call is simpler and more robust than detecting which specific queries
// have all-required variables.
const internalHookCall = /return ApolloReactHooks\.(useQuery|useLazyQuery|useSuspenseQuery)<([^;]+?)>\((\w+Document), options\);/g

source = source.replace(internalHookCall, "return ApolloReactHooks.$1<$2>($3, options as any);")

writeFileSync(path, source)
