// typescript-react-apollo@4.4.2's generated useXSuspenseQuery overloads don't
// fully match Apollo Client v4's actual useSuspenseQuery types - the plugin
// already anticipates some drift (a `// @ts-ignore` before the first
// overload, generated unconditionally by its own template), but not the
// second (SkipToken) overload, which fails TS2394 against v4. No plugin
// config disables just the Suspense hook variant, and this file regenerates
// on every `npm run codegen`, so the fix has to run as a post-codegen step
// rather than a one-off hand edit.
import { readFileSync, writeFileSync } from "node:fs"

const path = "src/lib/graphql/generated/graphql.ts"
const source = readFileSync(path, "utf8")

const brokenOverload =
  /^(export function use\w+SuspenseQuery\(baseOptions\?: .*SkipToken \| .*SuspenseQueryHookOptions<.*>\): .*UseSuspenseQueryResult<.* \| undefined,.*>;)$/gm

const patched = source.replace(
  brokenOverload,
  "// @ts-expect-error - known typescript-react-apollo/Apollo Client v4 overload mismatch, see scripts/fix-codegen-suspense-overloads.mjs\n$1"
)

writeFileSync(path, patched)
