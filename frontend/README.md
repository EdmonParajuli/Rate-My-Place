# Rate My Place — frontend

React SPA (Vite + TypeScript) for Rate My Place. See [../docs/05-frontend-plan.md](../docs/05-frontend-plan.md)
for the full stack rationale and structure sketch this scaffold follows.

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173, expects the backend running at http://localhost:4000/graphql
npm run build         # tsc typecheck + production build to dist/
npm run codegen       # regenerate src/lib/graphql/generated/ from the live backend schema
```

`VITE_GRAPHQL_URL` overrides the backend GraphQL endpoint (defaults to `http://localhost:4000/graphql`)
for both the running app and `codegen`.

## Stack

Vite, React, TypeScript, Tailwind CSS v4, shadcn/ui (Radix base), React Router, Apollo Client,
GraphQL Code Generator (typed Apollo hooks), React Hook Form + Zod.

## Known workarounds

- **Vite pinned to 7.x, not 8.x**: Vite 8's Rolldown bundler requires Node `^20.19.0 || >=22.12.0`;
  this repo's dev environment is on `22.11.0`, one minor version short, which causes npm to silently
  skip installing Rolldown's native binding on a plain `npm install`. Vite 7 has no such requirement.
  Revisit once Node is upgraded.
- **`@vitejs/plugin-react` pinned to `^5.2.0`**: the `6.x` line requires Vite `^8.0.0`.
- **`scripts/fix-codegen-suspense-overloads.mjs`**: `@graphql-codegen/typescript-react-apollo@4.4.2`
  generates a `useXSuspenseQuery` overload that doesn't type-check against Apollo Client v4's actual
  types (a gap in the plugin's current Apollo Client v4 support, not a project bug). This script patches
  the generated file after every `codegen` run; revisit once the plugin catches up. The regular
  `useXQuery`/`useXLazyQuery` hooks are unaffected.
- **Apollo Client v4 import paths**: React bindings (`ApolloProvider`, hooks) moved to
  `@apollo/client/react` in v4 (previously the package root) — `codegen.ts`'s
  `apolloReactCommonImportFrom`/`apolloReactHooksImportFrom` point the generated hooks there; hand-written
  code (`src/lib/graphql/client.ts`, `src/App.tsx`) imports from the same path directly.
- **`@graphql-codegen/typescript`/`typescript-operations` pinned to `5.x`, not their `6.x` line**:
  combining `typescript@6.x`+`typescript-operations@6.x` with `typescript-react-apollo@4.4.2` (its latest
  - there's no `5.x`/`6.x` line for it yet) produced duplicate top-level `input`/`enum` type declarations
  (`TS2300`) the moment an operation actually took one as a variable (first hit once auth operations were
  added - `platformStats`, the only query before that, takes none). Pinning the first two plugins to their
  latest `5.x` (matching `typescript-react-apollo`'s own generation) fixed it - a plugin-family
  version-generation mismatch, not a config error.
- **`withMutationFn`/`withMutationOptionsType` set to `false`**: `typescript-react-apollo@4.4.2` still
  references Apollo Client v3's flat `MutationFunction<T,V>`/`BaseMutationOptions<T,V>` exports for these
  two helper types - neither exists in v4's `@apollo/client/react` (mutation typings moved to a
  namespace-based shape). Only disables those two extra helper-type exports; the `useXMutation()` hooks
  themselves (`withHooks`) still generate and work correctly.
