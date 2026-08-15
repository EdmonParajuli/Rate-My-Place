import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { NotificationService } from "../../services/notificationService";
import { throwError } from "../../helpers/errorHelper";
import { SuccessResponse } from "../../helpers/responseHelper";

enum NotificationFilterEnum {
    ALL = "ALL",
    UNREAD = "UNREAD"
}

export const notificationResolver = {
    Query: {
        myNotifications: async(
            parent: ParentNode,
            args: { filter?: NotificationFilterEnum },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const data = await new NotificationService().getForUser(user.id, args.filter ?? NotificationFilterEnum.ALL);

                return SuccessResponse.send({
                    message: "Notifications fetched successfully",
                    data
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        unreadNotificationCount: async(
            parent: ParentNode,
            args: unknown,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                return await new NotificationService().getUnreadCount(user.id);
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    },
    Mutation: {
        markNotificationRead: async(
            parent: ParentNode,
            args: { notificationId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                await new NotificationService().markAsRead(user.id, args.notificationId);

                return { message: "Notification marked as read" };
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        markAllNotificationsRead: async(
            parent: ParentNode,
            args: unknown,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                await new NotificationService().markAllAsRead(user.id);

                return { message: "All notifications marked as read" };
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        deleteNotification: async(
            parent: ParentNode,
            args: { notificationId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                await new NotificationService().deleteNotification(user.id, args.notificationId);

                return { message: "Notification deleted" };
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    }
}
