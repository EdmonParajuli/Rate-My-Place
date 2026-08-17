import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const reviewVoteTypedefs: DocumentNode = gql`
    #graphql

    type ToggleHelpfulVoteResponse {
        message: String
        helpfulCount: Int
        helpfulByMe: Boolean
    }

    extend type Review {
        helpfulCount: Int
        helpfulByMe: Boolean @complexity(value: 2)
    }

    extend type Mutation {
        toggleHelpfulVote(reviewId: Int!): ToggleHelpfulVoteResponse
    }
`
