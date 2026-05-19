import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { InputAuthSignUpInterface, SignUpResponseInterface, UserInterface } from "../interfaces";
import { signToken } from "../utils/jwt";
import { UserRepository } from "../repositories/userRepository";

dotenv.config();

export class AuthService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  public async signUp(input: InputAuthSignUpInterface): Promise<SignUpResponseInterface> {
    const { email, password, name, userType } = input;

    /**Check if email already exists for user**/
    const existingUser = await  this.repository.findOne({ where: {email} });
    if (existingUser) {
        throw new GraphQLError("User already exists.", {
            extensions: {
              code: "BAD_USER_INPUT",
              status: 404,
              message: `User with email ${email} already exists.`,
            },
          });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PASSWORD_HASH_CONSTANT!));

    const user = await  this.repository.create({email, passwordHash: hashedPassword, fullName: name, userType});

    const {accessToken, refreshToken} = signToken(
      user.id,
      user.userType
    )

    return ({
        id: user.id,
        email: user.email,
        userType: user.userType,
        fullName: user.fullName,
        accessToken,
        refreshToken
      })
  }
}
