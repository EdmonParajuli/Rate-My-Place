import { GraphQLError } from "graphql";
import { ContextInterface } from "../interfaces";
import { UserTypeEnum } from "../enums/userTypesEnum";

export const requireAuth = (context: ContextInterface) => {
    if(!context.user){
        throw new GraphQLError("Auth Failed",{
            extensions: {
                code: "UNAUTHENTICATED",
                message: "You must be logged in to perform this action",
                status: 401
            },
        })
    }

    return context.user;
}

export const requireOwner = (context: ContextInterface) => {
    const user = requireAuth(context);
    if(user.userType !== UserTypeEnum["BUSINESS"]){
        throw new GraphQLError("Authorization Failed",{
            extensions: {
                code: "UNAUTHORIZED",
                message: "You dont have permission to perform this action",
                status: 403
            }
        })
    }

    return context.user;
}