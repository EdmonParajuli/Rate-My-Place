import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { Validator } from "../../middlewares";
import { createReviewSchema, updateReviewSchema } from "../../validators/reviewValidators";
import { ReviewService } from "../../services/reviewService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";
import { UserService } from "../../services/userService";
import PlaceService from "../../services/placeService";
import { ReviewInterface } from "../../interfaces/reviewInterface";

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
        },

        updateReview: async(
            parent: ParentNode,
            args: { reviewId: number, input: { review?: string; rating?: number } },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                Validator.check(updateReviewSchema, args.input);

                const result = await new ReviewService().updateReview({
                    reviewId: args.reviewId,
                    requestingUserId: user.id,
                    review: args.input.review,
                    rating: args.input.rating,
                });

                return SuccessResponse.send({
                    message: "Review updated successfully",
                    data: result
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        deleteReview: async(
            parent: ParentNode,
            args: { reviewId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                await new ReviewService().deleteReview(args.reviewId, user.id);

                return SuccessResponse.send({
                    message: "Review deleted successfully"
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    },
    Query: {
        placeReviews: async(
            parent: ParentNode,
            args: { placeId: number, first?: number, after?: string },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const { data, pageInfo } = await new ReviewService().listByPlace(args.placeId, {
                    first: args.first,
                    after: args.after,
                });

                return SuccessResponse.send({
                    message: "Reviews fetched successfully",
                    data,
                    pageInfo
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        myReviews: async(
            parent: ParentNode,
            args: { first?: number, after?: string },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const { data, pageInfo } = await new ReviewService().listByReviewer(user.id, {
                    first: args.first,
                    after: args.after,
                });

                return SuccessResponse.send({
                    message: "Your reviews fetched successfully",
                    data,
                    pageInfo
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    },
    Review: {
        reviewer: async (parent: ReviewInterface) => {
            return new UserService().getById(parent.reviewerId);
        },
        place: async (parent: ReviewInterface) => {
            return new PlaceService().getPlaceById(parent.placeId);
        }
    }
}
