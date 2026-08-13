import { GraphQLError } from "graphql";

export const throwError = (message: string, code: string, status: number): never => {
  throw new GraphQLError(message, {
    extensions: { code, status },
  });
};
