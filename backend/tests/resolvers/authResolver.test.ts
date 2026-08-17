import bcrypt from "bcrypt";
import { UserRepository } from "../../src/repositories/userRepository";
import { PasswordResetTokenRepository } from "../../src/repositories/passwordResetTokenRepository";
import { SessionService } from "../../src/services/sessionService";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";
import { execute, contextAs, firstError } from "./helpers";

jest.mock("../../src/repositories/userRepository");
jest.mock("../../src/repositories/passwordResetTokenRepository");
jest.mock("../../src/services/sessionService");

const mockFindOne = UserRepository.prototype.findOne as jest.Mock;
const mockFindByPk = UserRepository.prototype.findByPk as jest.Mock;
const mockCreateSession = SessionService.prototype.createSession as jest.Mock;
const mockRevokeByToken = SessionService.prototype.revokeByToken as jest.Mock;

const LOGIN = `
  mutation Login($input: InputAuthLogin!) {
    login(input: $input) {
      message
      data { token { access refresh } user { id email } }
    }
  }
`;

const AUTH_ME = `query { authMeUser { message data { id email } } }`;

const SIGN_OUT = `
  mutation SignOut($input: InputRefreshToken!) {
    signOut(input: $input) { message }
  }
`;

describe("authResolver (GraphQL execution)", () => {
  beforeEach(() => {
    mockCreateSession.mockResolvedValue({ id: "session-1" });
  });

  describe("login", () => {
    it("returns a token + user on valid credentials", async () => {
      const passwordHash = await bcrypt.hash("correct-password", 4);
      mockFindOne.mockResolvedValue({
        id: 1,
        email: "jane@example.com",
        passwordHash,
        userType: UserTypeEnum.REGULAR,
      });

      const result = await execute(LOGIN, {
        variableValues: { input: { email: "jane@example.com", password: "correct-password" } },
      });

      expect(result.errors).toBeUndefined();
      const data = result.data?.login as any;
      expect(data.data.token.access).toEqual(expect.any(String));
      expect(data.data.user.email).toBe("jane@example.com");
    });

    it("rejects an unregistered email with UNAUTHENTICATED, not a crash", async () => {
      mockFindOne.mockResolvedValue(null);

      const result = await execute(LOGIN, {
        variableValues: { input: { email: "nobody@example.com", password: "whatever1" } },
      });

      expect(result.data?.login).toBeNull();
      expect(firstError(result.errors).extensions.code).toBe("UNAUTHENTICATED");
    });

    it("rejects malformed input via Joi before ever touching the repository", async () => {
      const result = await execute(LOGIN, {
        variableValues: { input: { email: "not-an-email", password: "whatever1" } },
      });

      expect(firstError(result.errors)).toBeDefined();
      expect(mockFindOne).not.toHaveBeenCalled();
    });
  });

  describe("authMeUser", () => {
    it("returns the caller's user record when authenticated", async () => {
      mockFindByPk.mockResolvedValue({ id: 1, email: "jane@example.com" });

      const result = await execute(AUTH_ME, { context: contextAs("1", UserTypeEnum.REGULAR) });

      expect(result.errors).toBeUndefined();
      expect((result.data?.authMeUser as any).data.email).toBe("jane@example.com");
    });

    // Regression coverage for doc 2's original "schema declares this, but
    // nothing enforces auth on it" class of bug - a mocked-service unit test
    // can't catch this because it never goes through the resolver at all.
    it("rejects an unauthenticated caller with UNAUTHENTICATED", async () => {
      const result = await execute(AUTH_ME, { context: {} });

      expect(result.data?.authMeUser).toBeNull();
      expect(firstError(result.errors).extensions.code).toBe("UNAUTHENTICATED");
    });
  });

  describe("signOut", () => {
    // doc 2's issue 3 was exactly this mutation (declared in typeDefs, never
    // implemented) - a real end-to-end execution is what would have caught it.
    it("revokes the session and returns a confirmation message", async () => {
      mockRevokeByToken.mockResolvedValue(undefined);

      const result = await execute(SIGN_OUT, {
        variableValues: { input: { refreshToken: "a-refresh-token" } },
        context: contextAs("user-1", UserTypeEnum.REGULAR),
      });

      expect(result.errors).toBeUndefined();
      expect((result.data?.signOut as any).message).toBe("Signed out successfully");
      expect(mockRevokeByToken).toHaveBeenCalledWith("a-refresh-token", "user-1");
    });

    it("rejects an unauthenticated caller", async () => {
      const result = await execute(SIGN_OUT, {
        variableValues: { input: { refreshToken: "a-refresh-token" } },
        context: {},
      });

      expect(firstError(result.errors).extensions.code).toBe("UNAUTHENTICATED");
      expect(mockRevokeByToken).not.toHaveBeenCalled();
    });
  });
});
