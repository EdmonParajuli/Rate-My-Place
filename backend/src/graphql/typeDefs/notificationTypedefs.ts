import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const notificationTypedefs: DocumentNode = gql`
    #graphql

    enum NotificationTypeEnum {
        REVIEW_REPLY
        NEW_REVIEW
        BADGE_EARNED
        WATCHED_PLACE_REVIEW
        HELPFUL_VOTE_RECEIVED
    }

    enum NotificationFilterEnum {
        ALL
        UNREAD
    }

    type Notification {
        id: Int
        type: NotificationTypeEnum
        message: String
        placeId: Int
        # Resolved on demand from placeId - null for BADGE_EARNED. The
        # REGULAR Notifications screen uses place.label as an avatar-initials
        # stand-in since no per-notification actor identity (photo/name)
        # exists anywhere in this schema.
        place: Place
        read: Boolean
        createdAt: String
    }

    type NotificationListResponse {
        message: String
        data: [Notification]
    }

    extend type Query {
        myNotifications(filter: NotificationFilterEnum): NotificationListResponse
        unreadNotificationCount: Int
    }

    extend type Mutation {
        markNotificationRead(notificationId: Int!): Message
        markAllNotificationsRead: Message
        deleteNotification(notificationId: Int!): Message
    }
`
