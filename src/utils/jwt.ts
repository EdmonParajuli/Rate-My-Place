import { UserTypeEnum } from "../enums/userTypesEnum";
import crypto from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const signToken = (id: string, userType: UserTypeEnum) => {
  const accessToken = jwt.sign(
    { id, userType },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    // jti makes every refresh token unique even when issued for the same
    // user within the same second, which would otherwise sign byte-identical
    // tokens (same payload + iat) and collide on the sessions table's unique
    // hash constraint.
    { id, userType, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

export const verifyJwt = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    ) as JwtPayload;

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const verifyRefreshJwt = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET!
    ) as JwtPayload;

    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};
