import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { Validator } from "../../middlewares";
import { createReviewReplySchema, updateReviewReplySchema } from "../../validators/reviewReplyValidators";
import { ReviewReplyService } from "../../services/reviewReplyService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";

export const reviewReplyResolver = {
    Mutation: {
        createReviewReply: async(
            parent: ParentNode,
            args: { reviewId: number, input: { description: string } },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                Validator.check(createReviewReplySchema, args.input);

                const result = await new ReviewReplyService().createReply({
                    reviewId: args.reviewId,
                    requestingUserId: user.id,
                    description: args.input.description,
                });

                return SuccessResponse.send({
                    message: "Reply created successfully",
                    data: result
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        updateReviewReply: async(
            parent: ParentNode,
            args: { replyId: number, input: { description: string } },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                Validator.check(updateReviewReplySchema, args.input);

                const result = await new ReviewReplyService().updateReply({
                    replyId: args.replyId,
                    requestingUserId: user.id,
                    description: args.input.description,
                });

                return SuccessResponse.send({
                    message: "Reply updated successfully",
                    data: result
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        deleteReviewReply: async(
            parent: ParentNode,
            args: { replyId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                await new ReviewReplyService().deleteReply(args.replyId, user.id);

                return SuccessResponse.send({
                    message: "Reply deleted successfully"
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
