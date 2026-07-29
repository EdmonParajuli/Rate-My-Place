import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const categoryTypedefs: DocumentNode = gql`
    #graphql

    type Category {
        id: Int
        label: String
        description: String
        icon: String
    }

    type CategoryResponse {
        message: String
        data: Category
    }

    type CategoryListResponse {
        message: String
        data: [Category]
    }

    extend type Query {
        categories: CategoryListResponse
        category(id: Int!): CategoryResponse
    }
`
