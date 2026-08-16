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

    enum ReviewSortEnum {
        RECENT
        HELPFUL
    }

    type Review {
        id: Int
        review: String
        rating: Int
        placeId: Int
        reviewerId: Int
        reviewer: User
        place: Place
        createdAt: String
    }

    type ReviewResponse {
        message: String
        data: Review
    }

    type ReviewListResponse {
        message: String
        data: [Review]
        pageInfo: PageInfo
    }

    extend type Mutation {
        createReview(placeId: Int!, input: InputReview!): ReviewResponse
        updateReview(reviewId: Int!, input: InputUpdateReview!): ReviewResponse
        deleteReview(reviewId: Int!): Message
    }

    extend type Query {
        placeReviews(placeId: Int!, first: Int, after: String, sort: ReviewSortEnum): ReviewListResponse
        myReviews(first: Int, after: String): ReviewListResponse
        # Single-review scoped, unlike placeReviews/myReviews - lets the
        # frontend fetch a review's photos (Review.photos) without embedding
        # that live resolver in a list query, which would be a real N+1. See
        # docs/specs/phase-8-media-plumbing.md.
        getReviewById(id: Int!): ReviewResponse
    }
`
