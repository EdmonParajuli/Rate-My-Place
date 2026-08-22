import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const businessDashboardTypedefs: DocumentNode = gql`
    #graphql

    type MonthlyRatingPoint {
        month: String
        averageRating: Float
    }

    type MonthlyVolumePoint {
        month: String
        reviewCount: Int
    }

    type SentimentBreakdown {
        positivePercent: Float
        neutralPercent: Float
        negativePercent: Float
    }

    type BusinessDashboardStats {
        placeId: Int
        placeName: String
        reputationScore: Int
        reputationScoreTrend: Int
        averageRating: Float
        averageRatingTrend: Float
        reviewCount: Int
        reviewCountTrend: Int
        responseRate: Float
        responseRateTrend: Float
        pendingReplyCount: Int
        ratingTrend: [MonthlyRatingPoint]
        reviewVolume: [MonthlyVolumePoint]
        sentiment: SentimentBreakdown
        insights: [String]
    }

    type BusinessDashboardResponse {
        message: String
        data: BusinessDashboardStats
    }

    extend type Query {
        businessDashboard: BusinessDashboardResponse
    }
`
