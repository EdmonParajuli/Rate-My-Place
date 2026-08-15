import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { BusinessDashboardService } from "../../services/businessDashboardService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";
import { requireOwner } from "../../utils/auth";

export const businessDashboardResolver = {
    Query: {
        businessDashboard: async(
            parent: ParentNode,
            args: null,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireOwner(context);
                const result = await new BusinessDashboardService().getDashboard(user.id);

                return SuccessResponse.send({
                    message: "Business dashboard fetched successfully",
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
