import { ContextInterface, InputAuthLoginInterface, InputAuthSignUpInterface } from "../../interfaces";
import { Validator } from "../../middlewares";
import { loginSchema, signUpSchema } from "../../validators";
import { GraphQLResolveInfo } from "graphql";
import { AuthService } from "../../services/authService";
import { SuccessResponse } from "../../helpers/responseHelper";
import { throwError } from "../../helpers/errorHelper";
import { requireAuth } from "../../utils/auth";
import { UserRepository } from "../../repositories/userRepository";

export const authResolvers = {
  Mutation: {
    signUp: async (
      parent: ParentNode,
      args: { input: InputAuthSignUpInterface },
      context: ContextInterface,
      info: GraphQLResolveInfo
    ) => {
      try {
        args.input.email = args.input?.email.toLowerCase();
        Validator.check(signUpSchema, args.input);

        const result = await new AuthService().signUp(args.input);

        return SuccessResponse.send({
          message: "Signup successfully",
          data: result
        });
      } catch (error: any) {
        throwError(error.message, "BAD_USER_INPUT", 404);
      }
    },

    login: async(
      parent: ParentNode,
      args:{input: InputAuthLoginInterface },
      context: ContextInterface,
      info: GraphQLResolveInfo
    ) => {
      try{
        Validator.check(loginSchema, args.input);
        args.input.email = args.input?.email.toLowerCase();
        
        const result = await new AuthService().login(args.input, context);

        return SuccessResponse.send({
          message: "Login successfully",
          data: result
        });
        
      }catch(error: any){
        throwError(error.message, "BAD_USER_INPUT", 404);
      }
    }
  },
  Query:{
    authMeUser: async(
      parent: ParentNode,
      args: null,
      context: ContextInterface,
      info: GraphQLResolveInfo
    )=>{
      const user = requireAuth(context);

      const result = await new UserRepository().findByPk(user.id!);

      return SuccessResponse.send({
        message: "Auth me fetched successfully",
        data: result
      })
    }
  }
};
