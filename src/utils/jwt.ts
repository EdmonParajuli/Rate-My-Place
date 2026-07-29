import { UserTypeEnum } from "../enums/userTypesEnum";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const signToken = (userid: string, userType: UserTypeEnum) => {
  const accessToken = jwt.sign(
    { userid, userType },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    } as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    { userid, userType },
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
