import { ContextInterface, InputAuthSignUpInterface } from "../../interfaces";
import { Validator } from "../../middlewares";
import { signUp } from "../../validators";
import { GraphQLError, GraphQLResolveInfo } from "graphql";
import { AuthService } from "../../services/authService";
import { SuccessResponse } from "../../helpers/responseHelper";

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
        Validator.check(signUp, args.input);

        const result = await new AuthService().signUp(args.input);

        return SuccessResponse.send({
          message: "Signup successfully",
          data: result
        });
      } catch (error: any) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
            status: 404,
          },
        });
      }
    },
  },
};
