import { UserTypeEnum } from "../enums/userTypesEnum";
import jwt from "jsonwebtoken";
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
