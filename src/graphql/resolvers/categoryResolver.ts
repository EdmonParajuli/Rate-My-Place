import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { CategoryService } from "../../services/categoryService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";

export const categoryResolver = {
    Query: {
        categories: async(
            parent: ParentNode,
            args: null,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const result = await new CategoryService().list();

                return SuccessResponse.send({
                    message: "Categories fetched successfully",
                    data: result
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        category: async(
            parent: ParentNode,
            args: { id: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const result = await new CategoryService().getById(args.id);

                return SuccessResponse.send({
                    message: "Category fetched successfully",
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
