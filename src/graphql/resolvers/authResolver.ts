import { ContextInterface, InputAuthLoginInterface, InputAuthSignUpInterface } from "../../interfaces";
import { Validator } from "../../middlewares";
import {
  changePasswordSchema,
  confirmForgotPasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  signOutSchema,
  signUpSchema,
} from "../../validators";
import { GraphQLError, GraphQLResolveInfo } from "graphql";
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

        const result = await new AuthService().signUp(args.input, context);

        return SuccessResponse.send({
          message: "Signup successfully",
          data: result
        });
      } catch (error: any) {
        if (error instanceof GraphQLError) {
          throw error;
        }
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
        if (error instanceof GraphQLError) {
          throw error;
        }
        throwError(error.message, "BAD_USER_INPUT", 404);
      }
    },

    signOut: async(
      parent: ParentNode,
      args: { input: { refreshToken: string } },
      context: ContextInterface,
      info: GraphQLResolveInfo
    ) => {
      try {
        const user = requireAuth(context);
        Validator.check(signOutSchema, args.input);

        await new AuthService().signOut(user.id, args.input.refreshToken);

        return { message: "Signed out successfully" };
      } catch (error: any) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throwError(error.message, "BAD_REQUEST", 400);
      }
    },

    forgotPassword: async(
      parent: ParentNode,
      args: { input: { email: string } },
      context: ContextInterface,
      info: GraphQLResolveInfo
    ) => {
      try {
        args.input.email = args.input?.email.toLowerCase();
        Validator.check(forgotPasswordSchema, args.input);

        await new AuthService().forgotPassword(args.input);

        // Same message whether or not the email is registered - don't let a
        // caller use this mutation to enumerate accounts.
        return { message: "If that email is registered, a reset code has been sent." };
      } catch (error: any) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throwError(error.message, "BAD_REQUEST", 400);
      }
    },

    changePassword: async(
      parent: ParentNode,
      args: { input: { previousPassword: string; newPassword: string; confirmNewPassword: string; refreshToken?: string } },
      context: ContextInterface,
      info: GraphQLResolveInfo
    ) => {
      try {
        const user = requireAuth(context);
        Validator.check(changePasswordSchema, args.input);

        await new AuthService().changePassword(user.id, args.input);

        return { message: "Password changed successfully" };
      } catch (error: any) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throwError(error.message, "BAD_REQUEST", 400);
      }
    },

    confirmForgotPassword: async(
      parent: ParentNode,
      args: { input: { email: string; verificationCode: string; newPassword: string } },
      context: ContextInterface,
      info: GraphQLResolveInfo
    ) => {
      try {
        args.input.email = args.input?.email.toLowerCase();
        Validator.check(confirmForgotPasswordSchema, args.input);

        await new AuthService().confirmForgotPassword(args.input);

        return { message: "Password reset successfully" };
      } catch (error: any) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throwError(error.message, "BAD_REQUEST", 400);
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

      const result = await new UserRepository().findByPk(user.id);

      return SuccessResponse.send({
        message: "Auth me fetched successfully",
        data: result
      })
    }
  }
};
