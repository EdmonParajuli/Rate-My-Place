import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const reviewTypedefs: DocumentNode = gql`
    #graphql

    input InputReview {
        review: String!
        rating: Int!
    }

    input InputUpdateReview {
        review: String
        rating: Int
    }

    type Review {
        id: Int
        review: String
        rating: Int
        placeId: Int
        reviewerId: Int
    }

    type ReviewResponse {
        message: String
        data: Review
    }

    extend type Mutation {
        createReview(placeId: Int!, input: InputReview!): ReviewResponse
        updateReview(reviewId: Int!, input: InputUpdateReview!): ReviewResponse
        deleteReview(reviewId: Int!): Message
    }
`
