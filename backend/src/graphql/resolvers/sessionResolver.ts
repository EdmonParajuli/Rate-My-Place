import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { SessionService } from "../../services/sessionService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";

export const sessionResolver = {
    Mutation: {
        refreshAccessToken: async(
            parent: ParentNode,
            args: { input: { refreshToken: string } },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const { accessToken, refreshToken, sessionId } = await new SessionService().renew(
                    args.input.refreshToken,
                    {
                        userAgent: context.headers?.["user-agent"] as string | undefined,
                        ip: context.ip,
                    }
                );

                return SuccessResponse.send({
                    message: "Access token refreshed successfully",
                    data: { access: accessToken, refresh: refreshToken, sessionId },
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        revokeSession: async(
            parent: ParentNode,
            args: { sessionId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);
                await new SessionService().revokeById(args.sessionId, user.id);

                return SuccessResponse.send({
                    message: "Session revoked successfully",
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },
    },
    Query: {
        activeSessions: async(
            parent: ParentNode,
            args: null,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);
                const sessions = await new SessionService().listActive(user.id);

                return SuccessResponse.send({
                    message: "Active sessions fetched successfully",
                    data: sessions,
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },
    },
}
