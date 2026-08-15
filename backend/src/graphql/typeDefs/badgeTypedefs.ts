import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const badgeTypedefs: DocumentNode = gql`
    #graphql

    enum BadgeKeyEnum {
        FIRST_REVIEW
        PROLIFIC_REVIEWER
        HELPFUL_REVIEWER
        EXPLORER
        ELITE_REVIEWER
    }

    type Badge {
        id: Int
        key: BadgeKeyEnum
        label: String
        description: String
        icon: String
        earned: Boolean
        earnedAt: String
    }

    type BadgeListResponse {
        message: String
        data: [Badge]
    }

    extend type Query {
        myBadges: BadgeListResponse
    }
`
