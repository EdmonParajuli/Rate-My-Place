import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { Validator } from "../../middlewares";
import { attachMediaSchema } from "../../validators/mediaValidators";
import { MediaService } from "../../services/mediaService";
import { MediaKindEnum } from "../../enums/mediaKindEnum";
import { MediaOwnerTypeEnum } from "../../enums/mediaOwnerTypeEnum";
import { throwError } from "../../helpers/errorHelper";
import { SuccessResponse } from "../../helpers/responseHelper";

export const mediaResolver = {
    Query: {
        mediaUploadSignature: async(
            parent: ParentNode,
            args: { ownerType: MediaOwnerTypeEnum; kind: MediaKindEnum; ownerId?: number | null },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const data = await new MediaService().getUploadSignature(user.id, args.ownerType, args.kind, args.ownerId);

                return SuccessResponse.send({
                    message: "Upload signature generated",
                    data
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    },
    Mutation: {
        attachMedia: async(
            parent: ParentNode,
            args: { input: { ownerType: MediaOwnerTypeEnum; ownerId?: number | null; kind: MediaKindEnum; url: string } },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);
                Validator.check(attachMediaSchema, args.input);

                const data = await new MediaService().attachMedia(user.id, args.input);

                return SuccessResponse.send({
                    message: "Media attached successfully",
                    data
                });
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        removeMedia: async(
            parent: ParentNode,
            args: { mediaId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                await new MediaService().removeMedia(user.id, args.mediaId);

                return { message: "Media removed" };
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        }
    }
}
