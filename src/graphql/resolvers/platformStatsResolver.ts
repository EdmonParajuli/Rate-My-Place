import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { PlatformStatsService } from "../../services/platformStatsService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";

export const platformStatsResolver = {
    Query: {
        platformStats: async(
            parent: ParentNode,
            args: null,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const result = await new PlatformStatsService().getStats();

                return SuccessResponse.send({
                    message: "Platform stats fetched successfully",
                    data: result
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
