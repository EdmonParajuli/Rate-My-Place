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
`
