import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const notificationTypedefs: DocumentNode = gql`
    #graphql

    enum NotificationTypeEnum {
        REVIEW_REPLY
        NEW_REVIEW
        BADGE_EARNED
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
