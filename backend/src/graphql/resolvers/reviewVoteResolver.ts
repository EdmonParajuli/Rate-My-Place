import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { ReviewVoteService } from "../../services/reviewVoteService";
import { throwError } from "../../helpers/errorHelper";

export const reviewVoteResolver = {
    Mutation: {
        toggleHelpfulVote: async(
            parent: ParentNode,
            args: { reviewId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const { helpfulCount, helpfulByMe } = await new ReviewVoteService().toggle(args.reviewId, user.id);

                // Flat response shape (no `data` wrapper) - per the spec, so the
                // frontend can update the button from this one round trip
                // without unwrapping an envelope.
                return {
                    message: helpfulByMe ? "Marked as helpful" : "Removed helpful vote",
                    helpfulCount,
                    helpfulByMe
                };
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    }
}
