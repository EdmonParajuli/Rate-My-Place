import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const reviewReplyTypedefs: DocumentNode = gql`
    #graphql

    input InputReviewReply {
        description: String!
    }

    input InputUpdateReviewReply {
        description: String!
    }

    type ReviewReply {
        id: Int
        reviewId: Int
        ownerId: Int
        description: String
        createdAt: String
    }

    type ReviewReplyResponse {
        message: String
        data: ReviewReply
    }

    extend type Review {
        reply: ReviewReply
    }

    extend type Mutation {
        createReviewReply(reviewId: Int!, input: InputReviewReply!): ReviewReplyResponse
        updateReviewReply(replyId: Int!, input: InputUpdateReviewReply!): ReviewReplyResponse
        deleteReviewReply(replyId: Int!): Message
    }
`
