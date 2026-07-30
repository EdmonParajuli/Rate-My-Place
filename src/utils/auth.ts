import { ContextInterface } from "../interfaces";
import { AuthTokenPayload } from "../interfaces/authInterface";
import { UserTypeEnum } from "../enums/userTypesEnum";
import { throwError } from "../helpers/errorHelper";

export const requireAuth = (context: ContextInterface): AuthTokenPayload => {
    if(!context.user){
        throwError("You must be logged in to perform this action", "UNAUTHENTICATED", 401);
    }

    return context.user!;
}

export const requireOwner = (context: ContextInterface): AuthTokenPayload => {
    const user = requireAuth(context);
    if(user.userType !== UserTypeEnum["BUSINESS"]){
        throwError("You dont have permission to perform this action", "UNAUTHORIZED", 403);
    }

    return user;
}

export const assertOwnership = (actualOwnerId: string | number, requestingUserId: string, message: string): void => {
    if(String(actualOwnerId) !== String(requestingUserId)){
        throwError(message, "FORBIDDEN", 403);
    }
}