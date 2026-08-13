import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const platformStatsTypedefs: DocumentNode = gql`
    #graphql

    type PlatformStats {
        totalPlaces: Int
        totalReviews: Int
    }

    type PlatformStatsResponse {
        message: String
        data: PlatformStats
    }

    extend type Query {
        platformStats: PlatformStatsResponse
    }
`
