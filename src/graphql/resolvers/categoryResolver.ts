import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { CategoryInterface } from "../../interfaces/categoryInterface";
import { CategoryService } from "../../services/categoryService";
import PlaceService from "../../services/placeService";
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
    },

    // Live-computed, not materialized/cached columns - same "recompute from
    // source" precedent as Place.averageRating itself. Two independent calls
    // to getCategoryStats (one per field) rather than resolving both from a
    // single fetch - same deferred-optimization tolerance this codebase
    // already applies elsewhere (no DataLoader/batching yet) at this scale
    // (11 categories today).
    Category: {
        businessCount: async (parent: CategoryInterface) => {
            const stats = await new PlaceService().getCategoryStats(parent.id);
            return stats.count;
        },
        avgRating: async (parent: CategoryInterface) => {
            const stats = await new PlaceService().getCategoryStats(parent.id);
            return stats.avgRating;
        }
    }
}
