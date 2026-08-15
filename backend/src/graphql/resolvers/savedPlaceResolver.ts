import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { requireAuth } from "../../utils/auth";
import { SavedPlaceService } from "../../services/savedPlaceService";
import PlaceService from "../../services/placeService";
import { throwError } from "../../helpers/errorHelper";
import { SavedListTypeEnum } from "../../enums/savedListTypeEnum";
import { SavedPlaceInterface } from "../../interfaces/savedPlaceInterface";
import { SuccessResponse } from "../../helpers/responseHelper";
import { PlaceInterface } from "../../interfaces/placeInterface";

enum SavedPlaceFilterEnum {
    ALL = "ALL",
    WANT_TO_VISIT = "WANT_TO_VISIT",
    FAVORITE = "FAVORITE"
}

export const savedPlaceResolver = {
    Query: {
        savedPlaces: async(
            parent: ParentNode,
            args: { filter?: SavedPlaceFilterEnum },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const all = await new SavedPlaceService().getForUser(user.id);
                const filter = args.filter ?? SavedPlaceFilterEnum.ALL;
                const data = filter === SavedPlaceFilterEnum.ALL
                    ? all
                    : all.filter((savedPlace) => (savedPlace.listType as string) === filter);

                return SuccessResponse.send({
                    message: "Saved places fetched successfully",
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
        toggleSavePlace: async(
            parent: ParentNode,
            args: { placeId: number },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const { savedByMe, listType } = await new SavedPlaceService().toggle(user.id, args.placeId);

                return {
                    message: savedByMe ? "Place saved" : "Place removed from saved",
                    savedByMe,
                    listType
                };
            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        setSavedPlaceListType: async(
            parent: ParentNode,
            args: { placeId: number, listType: SavedListTypeEnum },
            context: ContextInterface,
            info: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);

                const result = await new SavedPlaceService().setListType(user.id, args.placeId, args.listType);

                return SuccessResponse.send({
                    message: "Saved place updated",
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
    SavedPlace: {
        place: async (parent: SavedPlaceInterface) => {
            return new PlaceService().getPlaceById(parent.placeId);
        }
    },
    Place: {
        savedByMe: async (parent: PlaceInterface, args: unknown, context: ContextInterface) => {
            const saved = await new SavedPlaceService().hasSaved(parent.id, context.user?.id);
            return !!saved;
        },
        savedListType: async (parent: PlaceInterface, args: unknown, context: ContextInterface) => {
            const saved = await new SavedPlaceService().hasSaved(parent.id, context.user?.id);
            return saved?.listType ?? null;
        }
    }
}
