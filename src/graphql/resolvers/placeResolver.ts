import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { ContextInterface } from "../../interfaces";
import { InputPlaceInterface, PlaceInterface } from "../../interfaces/placeInterface";
import { requireAuth, requireOwner } from "../../utils/auth";
import { Validator } from "../../middlewares";
import { createPlaceSchema } from "../../validators/placeValidators";
import PlaceService from "../../services/placeService";
import { SuccessResponse } from "../../helpers/responseHelper";

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

                const result = await new PlaceService().createPlace({...args.input, ownerId: user.userid});

                return SuccessResponse.send({
                    message: "Place created successfully",
                    data: result
                });

            } catch (error: any) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: "BAD_REQUEST",
                        status: 400
                    }
                });
            }
        },
        updatePlace: async(
            parent: ParentNode,
            args: {placeId: number, input: InputPlaceInterface},
            context: ContextInterface,
            info: GraphQLResolveInfo 
        ) => {
            try {
                requireAuth(context);
                requireOwner(context);

                Validator.check(createPlaceSchema, args.input);

                const result = await new PlaceService().updatePlace(args);

                return SuccessResponse.send({
                    message: "Place updated successfully",
                    data: result
                });

            } catch (error: any) {
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: "BAD_REQUEST",
                        status: 400
                    }
                });
            }
        },

        deletePlace: async(
            parent: ParentNode,
            args: {placeId: number},
            context: ContextInterface,
            infor: GraphQLResolveInfo
        ) => {
            requireAuth(context);
            requireOwner(context);

            await new PlaceService().delete(args.placeId);

            return SuccessResponse.send({
                message: "Place deleted successfully"
            })
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
                throw new GraphQLError(error.message, {
                    extensions: {
                        code: "BAD_REQUEST",
                        status: 400
                    }
                });
            }
        }
    }
}
