import crypto from "crypto";
import { Op } from "sequelize";
import { SessionInterface } from "../interfaces/sessionInterface";
import { SessionRepository } from "../repositories/sessionRepository";
import { signToken, verifyRefreshJwt } from "../utils/jwt";
import { throwError } from "../helpers/errorHelper";
import { UserTypeEnum } from "../enums/userTypesEnum";

const parseDeviceLabel = (userAgent?: string): string | undefined => {
  if (!userAgent) return undefined;

  if (/Chrome/i.test(userAgent) && /Mac OS X/i.test(userAgent)) return "Chrome on macOS";
  if (/Chrome/i.test(userAgent) && /Windows/i.test(userAgent)) return "Chrome on Windows";
  if (/Chrome/i.test(userAgent) && /Android/i.test(userAgent)) return "Chrome on Android";
  if (/Safari/i.test(userAgent) && /iPhone/i.test(userAgent)) return "Safari on iPhone";
  if (/Safari/i.test(userAgent) && /Mac OS X/i.test(userAgent)) return "Safari on macOS";
  if (/Firefox/i.test(userAgent)) return "Firefox";

  return "Unknown device";
};

export class SessionService {
  private repository: SessionRepository;

  constructor() {
    this.repository = new SessionRepository();
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async createSession({
    userId,
    refreshToken,
    userAgent,
    ip,
  }: {
    userId: string;
    refreshToken: string;
    userAgent?: string;
    ip?: string;
  }): Promise<SessionInterface> {
    const decoded = verifyRefreshJwt(refreshToken);
    const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return this.repository.create({
      userId,
      refreshTokenHash: this.hashToken(refreshToken),
      deviceLabel: parseDeviceLabel(userAgent),
      userAgent,
      ipAddress: ip,
      lastUsedAt: new Date(),
      expiresAt,
    });
  }

  async renew(
    refreshToken: string,
    context: { userAgent?: string; ip?: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let decoded;
    try {
      decoded = verifyRefreshJwt(refreshToken);
    } catch {
      return throwError("Invalid or expired refresh token", "UNAUTHENTICATED", 401);
    }

    const session = await this.repository.findOne({
      where: { refreshTokenHash: this.hashToken(refreshToken) },
    });

    if (!session || session.revokedAt || new Date(session.expiresAt) < new Date()) {
      throwError("Invalid or expired refresh token", "UNAUTHENTICATED", 401);
    }

    // Rotate: this refresh token can only ever be used once. Revoking it here
    // means a replayed/stolen token fails outright on its second use.
    await this.repository.updateOne({ id: session.id, input: { revokedAt: new Date() } });

    const { accessToken, refreshToken: newRefreshToken } = signToken(
      decoded.id,
      decoded.userType as UserTypeEnum
    );

    await this.createSession({
      userId: decoded.id,
      refreshToken: newRefreshToken,
      userAgent: context.userAgent,
      ip: context.ip,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  async revokeByToken(refreshToken: string, userId: string): Promise<void> {
    const session = await this.repository.findOne({
      where: { refreshTokenHash: this.hashToken(refreshToken), userId },
    });

    if (session && !session.revokedAt) {
      await this.repository.updateOne({ id: session.id, input: { revokedAt: new Date() } });
    }
    // No error when nothing matches - signOut is idempotent and shouldn't
    // reveal whether a given token was ever valid.
  }

  async revokeById(sessionId: number, userId: string): Promise<void> {
    const session = await this.repository.findByPk(sessionId);

    if (!session || String(session.userId) !== String(userId)) {
      throwError("Session not found", "NOT_FOUND", 404);
    }

    await this.repository.updateOne({ id: sessionId, input: { revokedAt: new Date() } });
  }

  async revokeAllForUser(userId: string, exceptRefreshToken?: string): Promise<void> {
    const exceptHash = exceptRefreshToken ? this.hashToken(exceptRefreshToken) : undefined;

    const activeSessions = await this.repository.findAll({
      where: { userId, revokedAt: null },
    });

    await Promise.all(
      activeSessions
        .filter((session) => session.refreshTokenHash !== exceptHash)
        .map((session) =>
          this.repository.updateOne({ id: session.id, input: { revokedAt: new Date() } })
        )
    );
  }

  async listActive(userId: string): Promise<SessionInterface[]> {
    return this.repository.findAll({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [["lastUsedAt", "DESC"]],
    });
  }
}
