import bcrypt from "bcrypt";
import { GraphQLError } from "graphql";
import { AuthService } from "../../src/services/authService";
import { UserRepository } from "../../src/repositories/userRepository";
import { PasswordResetTokenRepository } from "../../src/repositories/passwordResetTokenRepository";
import { SessionService } from "../../src/services/sessionService";
import { UserTypeEnum } from "../../src/enums/userTypesEnum";
import { ContextInterface } from "../../src/interfaces";

jest.mock("../../src/repositories/userRepository");
jest.mock("../../src/repositories/passwordResetTokenRepository");
jest.mock("../../src/services/sessionService");

const mockFindOne = UserRepository.prototype.findOne as jest.Mock;
const mockFindByPk = UserRepository.prototype.findByPk as jest.Mock;
const mockCreate = UserRepository.prototype.create as jest.Mock;
const mockUpdateOne = UserRepository.prototype.updateOne as jest.Mock;

const mockTokenFindOne = PasswordResetTokenRepository.prototype.findOne as jest.Mock;
const mockTokenCreate = PasswordResetTokenRepository.prototype.create as jest.Mock;
const mockTokenUpdateOne = PasswordResetTokenRepository.prototype.updateOne as jest.Mock;

const mockCreateSession = SessionService.prototype.createSession as jest.Mock;
const mockRevokeByToken = SessionService.prototype.revokeByToken as jest.Mock;
const mockRevokeAllForUser = SessionService.prototype.revokeAllForUser as jest.Mock;

const context: ContextInterface = { headers: {}, ip: "127.0.0.1" };

async function expectGraphQLError(fn: () => Promise<unknown>, code: string) {
  try {
    await fn();
    fail("expected the promise to reject");
  } catch (error) {
    expect(error).toBeInstanceOf(GraphQLError);
    expect((error as GraphQLError).extensions.code).toBe(code);
  }
}

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    mockCreateSession.mockResolvedValue({ id: "session-1" });
  });

  describe("createUser", () => {
    it("rejects a signup when the email is already taken", async () => {
      mockFindOne.mockResolvedValue({ id: "existing-user" });

      await expectGraphQLError(
        () =>
          authService.createUser({
            email: "taken@example.com",
            password: "pw",
            name: "Someone",
            userType: UserTypeEnum.REGULAR,
          }),
        "BAD_USER_INPUT"
      );
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("hashes the plaintext password before persisting it", async () => {
      mockFindOne.mockResolvedValue(null);
      mockCreate.mockImplementation(async (input) => ({ id: "new-user", ...input }));

      await authService.createUser({
        email: "new@example.com",
        password: "plaintext-password",
        name: "New User",
        userType: UserTypeEnum.REGULAR,
      });

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const persistedInput = mockCreate.mock.calls[0][0];
      expect(persistedInput.passwordHash).not.toBe("plaintext-password");
      await expect(bcrypt.compare("plaintext-password", persistedInput.passwordHash)).resolves.toBe(true);
    });
  });

  describe("login", () => {
    it("rejects an unknown email without revealing the account doesn't exist", async () => {
      mockFindOne.mockResolvedValue(null);

      await expectGraphQLError(
        () => authService.login({ email: "nobody@example.com", password: "whatever" }, context),
        "UNAUTHENTICATED"
      );
      expect(mockCreateSession).not.toHaveBeenCalled();
    });

    it("rejects a correct email with the wrong password", async () => {
      const passwordHash = await bcrypt.hash("correct-password", 4);
      mockFindOne.mockResolvedValue({ id: "user-1", passwordHash, userType: UserTypeEnum.REGULAR });

      await expectGraphQLError(
        () => authService.login({ email: "user@example.com", password: "wrong-password" }, context),
        "UNAUTHENTICATED"
      );
      expect(mockCreateSession).not.toHaveBeenCalled();
    });

    it("issues tokens and creates a session on a correct email/password pair", async () => {
      const passwordHash = await bcrypt.hash("correct-password", 4);
      mockFindOne.mockResolvedValue({ id: "user-1", passwordHash, userType: UserTypeEnum.REGULAR });

      const result = await authService.login({ email: "user@example.com", password: "correct-password" }, context);

      expect(result.token.access).toEqual(expect.any(String));
      expect(result.token.refresh).toEqual(expect.any(String));
      expect(result.token.sessionId).toBe("session-1");
      expect(mockCreateSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", refreshToken: result.token.refresh })
      );
    });
  });

  describe("changePassword", () => {
    it("rejects when the previous password is wrong", async () => {
      const passwordHash = await bcrypt.hash("current-password", 4);
      mockFindByPk.mockResolvedValue({ id: "user-1", passwordHash });

      await expectGraphQLError(
        () =>
          authService.changePassword("user-1", { previousPassword: "not-it", newPassword: "new-password" }),
        "UNAUTHENTICATED"
      );
      expect(mockUpdateOne).not.toHaveBeenCalled();
    });

    it("updates the password hash and revokes other sessions on success", async () => {
      const passwordHash = await bcrypt.hash("current-password", 4);
      mockFindByPk.mockResolvedValue({ id: "user-1", passwordHash });

      await authService.changePassword("user-1", {
        previousPassword: "current-password",
        newPassword: "brand-new-password",
        refreshToken: "keep-me",
      });

      expect(mockUpdateOne).toHaveBeenCalledTimes(1);
      const [{ input }] = mockUpdateOne.mock.calls[0];
      await expect(bcrypt.compare("brand-new-password", input.passwordHash)).resolves.toBe(true);
      expect(mockRevokeAllForUser).toHaveBeenCalledWith("user-1", "keep-me");
    });
  });

  describe("forgotPassword", () => {
    it("is a silent no-op for an email that doesn't exist, so account existence isn't leaked", async () => {
      mockFindOne.mockResolvedValue(null);

      await authService.forgotPassword({ email: "nobody@example.com" });

      expect(mockTokenCreate).not.toHaveBeenCalled();
    });

    it("creates a hashed, single-use reset token for a real account", async () => {
      mockFindOne.mockResolvedValue({ id: "user-1" });

      await authService.forgotPassword({ email: "user@example.com" });

      expect(mockTokenCreate).toHaveBeenCalledTimes(1);
      const [{ userId, codeHash, expiresAt }] = mockTokenCreate.mock.calls[0];
      expect(userId).toBe("user-1");
      expect(codeHash).toEqual(expect.any(String));
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe("confirmForgotPassword", () => {
    it("rejects an invalid verification code", async () => {
      mockFindOne.mockResolvedValue({ id: "user-1" });
      mockTokenFindOne.mockResolvedValue(null);

      await expectGraphQLError(
        () =>
          authService.confirmForgotPassword({
            email: "user@example.com",
            verificationCode: "wrong-code",
            newPassword: "new-password",
          }),
        "UNAUTHENTICATED"
      );
    });

    it("rejects an expired verification code", async () => {
      mockFindOne.mockResolvedValue({ id: "user-1" });
      mockTokenFindOne.mockResolvedValue({
        id: "token-1",
        expiresAt: new Date(Date.now() - 1000),
      });

      await expectGraphQLError(
        () =>
          authService.confirmForgotPassword({
            email: "user@example.com",
            verificationCode: "expired-code",
            newPassword: "new-password",
          }),
        "UNAUTHENTICATED"
      );
      expect(mockUpdateOne).not.toHaveBeenCalled();
    });

    it("resets the password, marks the token used, and revokes all sessions on success", async () => {
      mockFindOne.mockResolvedValue({ id: "user-1" });
      mockTokenFindOne.mockResolvedValue({
        id: "token-1",
        expiresAt: new Date(Date.now() + 60_000),
      });

      await authService.confirmForgotPassword({
        email: "user@example.com",
        verificationCode: "valid-code",
        newPassword: "brand-new-password",
      });

      expect(mockUpdateOne).toHaveBeenCalledTimes(1);
      expect(mockTokenUpdateOne).toHaveBeenCalledWith(
        expect.objectContaining({ id: "token-1", input: { usedAt: expect.any(Date) } })
      );
      expect(mockRevokeAllForUser).toHaveBeenCalledWith("user-1");
    });
  });
});
