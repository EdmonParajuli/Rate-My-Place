import { graphql, GraphQLError } from "graphql";
import { schema } from "../../src/graphql/schema";
import { ContextInterface } from "../../src/interfaces";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";

// Executes a real query/mutation string against the actual composed schema
// (src/graphql/schema) - the same object Apollo Server runs in production -
// so these tests exercise the real resolver -> Validator.check() -> service
// chain end to end. Only repositories get mocked (see each *.test.ts file's
// jest.mock calls), so requireAuth/requireOwner/assertOwnership, Joi
// validation, and SuccessResponse's envelope shape all run for real. This is
// doc 6's "layer 3": catches schema/resolver drift a mocked-service unit
// test (layer 1) can't - e.g. a mutation declared in typeDefs but never
// wired into the resolver map at all.
export async function execute(source: string, options: { variableValues?: Record<string, unknown>; context?: ContextInterface } = {}) {
  const result = await graphql({
    schema,
    source,
    variableValues: options.variableValues,
    contextValue: options.context ?? {},
  });
  return result;
}

export function contextAs(id: string, userType: UserTypeEnum): ContextInterface {
  return { user: { id, userType } };
}

export function firstError(errors: readonly GraphQLError[] | undefined): GraphQLError {
  if (!errors || errors.length === 0) {
    throw new Error("expected at least one GraphQL error, got none");
  }
  return errors[0];
}
