import { GraphQLError } from "graphql";
import { requireAuth, requireOwner, assertOwnership } from "../../src/utils/auth";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";
import { ContextInterface } from "../../src/interfaces";

function contextWith(user: ContextInterface["user"]): ContextInterface {
  return { user };
}

describe("requireAuth", () => {
  it("returns context.user when logged in", () => {
    const user = { id: "1", userType: UserTypeEnum.REGULAR };
    expect(requireAuth(contextWith(user))).toBe(user);
  });

  it("throws UNAUTHENTICATED when there is no user on context", () => {
    expect(() => requireAuth(contextWith(undefined))).toThrow(GraphQLError);
    try {
      requireAuth(contextWith(undefined));
      fail("expected requireAuth to throw");
    } catch (error) {
      expect((error as GraphQLError).extensions.code).toBe("UNAUTHENTICATED");
      expect((error as GraphQLError).extensions.status).toBe(401);
    }
  });
});

describe("requireOwner", () => {
  it("returns the user when userType is BUSINESS", () => {
    const user = { id: "1", userType: UserTypeEnum.BUSINESS };
    expect(requireOwner(contextWith(user))).toBe(user);
  });

  it("throws UNAUTHORIZED when the logged-in user is REGULAR, not BUSINESS", () => {
    const user = { id: "1", userType: UserTypeEnum.REGULAR };
    try {
      requireOwner(contextWith(user));
      fail("expected requireOwner to throw");
    } catch (error) {
      expect((error as GraphQLError).extensions.code).toBe("UNAUTHORIZED");
      expect((error as GraphQLError).extensions.status).toBe(403);
    }
  });

  it("throws UNAUTHENTICATED (not UNAUTHORIZED) when there is no user at all", () => {
    try {
      requireOwner(contextWith(undefined));
      fail("expected requireOwner to throw");
    } catch (error) {
      expect((error as GraphQLError).extensions.code).toBe("UNAUTHENTICATED");
    }
  });
});

describe("assertOwnership", () => {
  it("does not throw when the ids match", () => {
    expect(() => assertOwnership("42", "42", "nope")).not.toThrow();
  });

  it("compares ids as strings, so a numeric id matches its string form", () => {
    expect(() => assertOwnership(42, "42", "nope")).not.toThrow();
  });

  it("throws FORBIDDEN with the given message when the ids differ", () => {
    try {
      assertOwnership("42", "99", "You do not own this review.");
      fail("expected assertOwnership to throw");
    } catch (error) {
      expect((error as GraphQLError).message).toBe("You do not own this review.");
      expect((error as GraphQLError).extensions.code).toBe("FORBIDDEN");
      expect((error as GraphQLError).extensions.status).toBe(403);
    }
  });
});
