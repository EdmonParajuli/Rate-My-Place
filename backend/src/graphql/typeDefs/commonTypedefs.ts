import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const commonTypedefs: DocumentNode = gql`
    #graphql

    type PageInfo {
        hasNextPage: Boolean!
        hasPreviousPage: Boolean!
        startCursor: String
        endCursor: String
    }

    # Read by src/utils/queryComplexityPlugin.ts (graphql-query-complexity's
    # directiveEstimator) to score a query before execution - see
    # docs/06-quality-and-ops.md's query-cost/depth-limiting item. Declared
    # once here since every feature's typeDefs file composes into one schema
    # (src/graphql/schema/index.ts). "value" is this field's own flat cost;
    # "multipliers" names sibling arguments (e.g. "first") whose numeric value
    # multiplies this field's cost plus everything selected under it - the
    # mechanism that makes requesting N rows of an expensive nested field
    # actually cost N times as much instead of a flat 1.
    directive @complexity(value: Int!, multipliers: [String]) on FIELD_DEFINITION
`
