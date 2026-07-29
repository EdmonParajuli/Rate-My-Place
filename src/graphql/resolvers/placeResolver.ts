import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { InputPlaceInterface, PlaceInterface } from "../../interfaces/placeInterface";
import { requireAuth, requireOwner } from "../../utils/auth";
import { Validator } from "../../middlewares";
import { createPlaceSchema } from "../../validators/placeValidators";
import PlaceService from "../../services/placeService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";

export const placeResolver = {
    Mutation: {
        createPlace: async(
            parent: ParentNode,
            args: {input: InputPlaceInterface},
            context: ContextInterface,
            info: GraphQLResolveInfo 
        ) => {
            try {
                const user = requireAuth(context);
                requireOwner(context);

                Validator.check(createPlaceSchema, args.input);

                const result = await new PlaceService().createPlace({...args.input, ownerId: user.id});

                return SuccessResponse.send({
                    message: "Place created successfully",
                    data: result
                });

            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },
        updatePlace: async(
            parent: ParentNode,
            args: {placeId: number, input: InputPlaceInterface},
            context: ContextInterface,
            info: GraphQLResolveInfo 
        ) => {
            try {
                const user = requireAuth(context);
                requireOwner(context);

                Validator.check(createPlaceSchema, args.input);

                const result = await new PlaceService().updatePlace({
                    ...args,
                    requestingUserId: user.id,
                });

                return SuccessResponse.send({
                    message: "Place updated successfully",
                    data: result
                });

            } catch (error: any) {
                if (error instanceof GraphQLError) {
                    throw error;
                }
                throwError(error.message, "BAD_REQUEST", 400);
            }
        },

        deletePlace: async(
            parent: ParentNode,
            args: {placeId: number},
            context: ContextInterface,
            infor: GraphQLResolveInfo
        ) => {
            try {
                const user = requireAuth(context);
                requireOwner(context);

                await new PlaceService().delete(args.placeId, user.id);

                return SuccessResponse.send({
                    message: "Place deleted successfully"
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
        getPlaceById: async(
            parent: ParentNode,
            args: {id: number},
            context: ContextInterface,
            info: GraphQLResolveInfo 
        ) => {
            try {
                requireAuth(context);

                const result = await new PlaceService().getPlaceById(args.id);

                return SuccessResponse.send({
                    message: "Place fetched successfully",
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
