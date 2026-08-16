import bcrypt from "bcrypt";
import crypto from "crypto";
import dotenv from "dotenv";
import { Transaction } from "sequelize";
import { InputAuthLoginInterface, InputAuthSignUpInterface, AuthResponseInterface, ContextInterface, UserInterface } from "../interfaces";
import { signToken } from "../utils/jwt";
import { UserRepository } from "../repositories/userRepository";
import { PasswordResetTokenRepository } from "../repositories/passwordResetTokenRepository";
import { SessionService } from "./sessionService";
import { throwError } from "../helpers/errorHelper";

dotenv.config();

const PASSWORD_RESET_CODE_TTL_MS = 15 * 60 * 1000;

const hashPassword = (password: string) =>
  bcrypt.hash(password, parseInt(process.env.PASSWORD_HASH_CONSTANT!));

const hashResetCode = (code: string) => crypto.createHash("sha256").update(code).digest("hex");

export class AuthService {
  private repository: UserRepository;
  private passwordResetTokenRepository: PasswordResetTokenRepository;
  private sessionService: SessionService;

  constructor() {
    this.repository = new UserRepository();
    this.passwordResetTokenRepository = new PasswordResetTokenRepository();
    this.sessionService = new SessionService();
  }

  // Extracted from signUp so BusinessOnboardingService.signUpBusiness can create
  // the User row inside its own transaction (alongside the Place row) without
  // also triggering token-signing/session-creation - those aren't part of the
  // atomicity signUpBusiness needs and must happen after commit, same as
  // ReviewService's "re-fetch happens after the transaction resolves" rule.
  public async createUser(
    input: InputAuthSignUpInterface,
    transaction?: Transaction
  ): Promise<UserInterface> {
    const { email, password, name, userType } = input;

    /**Check if email already exists for user**/
    const existingUser = await this.repository.findOne({ where: { email } });
    if (existingUser) {
      throwError(`User with email ${email} already exists.`, "BAD_USER_INPUT", 404);
    }

    const hashedPassword = await hashPassword(password);

    return this.repository.create(
      { email, passwordHash: hashedPassword, fullName: name, userType },
      { transaction }
    );
  }

  public async signUp(input: InputAuthSignUpInterface, context: ContextInterface): Promise<AuthResponseInterface> {
    const user = await this.createUser(input);

    const {accessToken, refreshToken} = signToken(
      user.id,
      user.userType
    )

    const session = await this.sessionService.createSession({
      userId: user.id,
      refreshToken,
      userAgent: context.headers?.["user-agent"] as string | undefined,
      ip: context.ip,
    });

    return ({
        user,
        token :{
          access: accessToken,
          refresh: refreshToken,
          sessionId: session.id
        }
      })
  }

  public async login(input: InputAuthLoginInterface, context: ContextInterface): Promise<AuthResponseInterface>{
    const {email, password} = input;

    const user = await this.repository.findOne({where: {email}});

    if(!user){
      throwError("Invalid email or password", "UNAUTHENTICATED", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if(!isPasswordValid){
      throwError("Invalid email or password", "UNAUTHENTICATED", 401);
    }

    const {accessToken, refreshToken} = signToken(
      user.id,
      user.userType
    )

    const session = await this.sessionService.createSession({
      userId: user.id,
      refreshToken,
      userAgent: context.headers?.["user-agent"] as string | undefined,
      ip: context.ip,
    });

    return {
      user,
      token: {
        access: accessToken,
        refresh: refreshToken,
        sessionId: session.id,
      },
    };
  }

  public async signOut(userId: string, refreshToken: string): Promise<void> {
    await this.sessionService.revokeByToken(refreshToken, userId);
  }

  public async changePassword(
    userId: string,
    input: { previousPassword: string; newPassword: string; refreshToken?: string }
  ): Promise<void> {
    const user = await this.repository.findByPk(userId);
    if (!user) {
      throwError("User not found", "UNAUTHENTICATED", 401);
    }

    const isPreviousPasswordValid = await bcrypt.compare(input.previousPassword, user.passwordHash);
    if (!isPreviousPasswordValid) {
      throwError("Previous password is incorrect", "UNAUTHENTICATED", 401);
    }

    const hashedPassword = await hashPassword(input.newPassword);
    await this.repository.updateOne({ id: userId, input: { passwordHash: hashedPassword } });

    // A password change should kick out anyone else holding a stolen refresh
    // token; keep the caller's own session (if they sent it) logged in.
    await this.sessionService.revokeAllForUser(userId, input.refreshToken);
  }

  public async forgotPassword(input: { email: string }): Promise<void> {
    const user = await this.repository.findOne({ where: { email: input.email } });

    // Always behave the same way regardless of whether the account exists -
    // the resolver returns one generic message either way, so nothing here
    // should let a caller tell the two cases apart from timing/response shape.
    if (!user) {
      return;
    }

    const code = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_CODE_TTL_MS);

    await this.passwordResetTokenRepository.create({
      userId: user.id,
      codeHash: hashResetCode(code),
      expiresAt,
    });

    // No email provider is wired up yet (see docs/06-quality-and-ops.md) -
    // surface the code outside production so the flow is testable end to end.
    if (process.env.NODE_ENV !== "production") {
      console.log(`[dev-only] Password reset code for ${input.email}: ${code}`);
    }
  }

  public async confirmForgotPassword(input: {
    email: string;
    verificationCode: string;
    newPassword: string;
  }): Promise<void> {
    const user = await this.repository.findOne({ where: { email: input.email } });
    if (!user) {
      throwError("Invalid or expired verification code", "UNAUTHENTICATED", 401);
    }

    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { userId: user.id, codeHash: hashResetCode(input.verificationCode), usedAt: null },
    });

    if (!resetToken || new Date(resetToken.expiresAt) < new Date()) {
      throwError("Invalid or expired verification code", "UNAUTHENTICATED", 401);
    }

    const hashedPassword = await hashPassword(input.newPassword);
    await this.repository.updateOne({ id: user.id, input: { passwordHash: hashedPassword } });
    await this.passwordResetTokenRepository.updateOne({
      id: resetToken.id,
      input: { usedAt: new Date() },
    });

    // A password reset is often the response to a suspected compromise -
    // there's no "current session" to preserve here, unlike changePassword.
    await this.sessionService.revokeAllForUser(user.id);
  }
}
