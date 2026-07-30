import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { Validator } from "../../middlewares";
import { createReviewSchema } from "../../validators/reviewValidators";
import { ReviewService } from "../../services/reviewService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";

export const reviewResolver = {
    Mutation: {
        createReview: async(
            parent: ParentNode,
            args: { placeId: number, input: { review: string; rating: number } },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                Validator.check(createReviewSchema, args.input);

                const result = await new ReviewService().createReview({
                    placeId: args.placeId,
                    reviewerId: user.id,
                    review: args.input.review,
                    rating: args.input.rating,
                });

                return SuccessResponse.send({
                    message: "Review created successfully",
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
