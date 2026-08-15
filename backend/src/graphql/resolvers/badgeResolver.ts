import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { BadgeService } from "../../services/badgeService";
import { throwError } from "../../helpers/errorHelper";
import { SuccessResponse } from "../../helpers/responseHelper";

export const badgeResolver = {
    Query: {
        myBadges: async(
            parent: ParentNode,
            args: unknown,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const data = await new BadgeService().getForUser(user.id);

                return SuccessResponse.send({
                    message: "Badges fetched successfully",
                    data
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    }
}
