import type { CodegenConfig } from "@graphql-codegen/cli"

// Points at the running local backend (introspection is enabled in
// backend/src/server.ts) rather than parsing schema files directly - the
// backend's typeDefs use @apollo/subgraph's buildSubgraphSchema, so
// introspecting the live server is simpler than reconciling that separately.
const config: CodegenConfig = {
  schema: process.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/graphql",
  documents: ["src/**/*.graphql"],
  generates: {
    "src/lib/graphql/generated/graphql.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
      config: {
        withHooks: true,
        // Apollo Client v4 split React bindings out of the package root
        // (into `@apollo/client/react`) - the plugin's v3-era default
        // ("@apollo/client") no longer has useQuery/ApolloProvider/etc.
        apolloReactCommonImportFrom: "@apollo/client/react",
        apolloReactHooksImportFrom: "@apollo/client/react",
        // tsconfig.app.json's erasableSyntaxOnly (matching this project's
        // native-type-stripping-compatible style) forbids real `enum`
        // declarations - union string-literal types instead, same as every
        // GraphQL enum value already being a plain string at runtime.
        enumsAsTypes: true,
      },
    },
  },
}

export default config
