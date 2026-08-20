import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireOwner } from "../../utils/auth";
import { ReviewQrCodeService } from "../../services/reviewQrCodeService";
import { throwError } from "../../helpers/errorHelper";
import { SuccessResponse } from "../../helpers/responseHelper";

export const reviewQrCodeResolver = {
    Query: {
        myReviewQrCode: async(
            parent: ParentNode,
            args: unknown,
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireOwner(context);

                const result = await new ReviewQrCodeService().getOrCreateForOwner(user.id);

                return SuccessResponse.send({
                    message: "QR code fetched successfully",
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
