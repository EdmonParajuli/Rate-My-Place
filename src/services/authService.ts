import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { InputAuthLoginInterface, InputAuthSignUpInterface, AuthResponseInterface, ContextInterface } from "../interfaces";
import { signToken } from "../utils/jwt";
import { UserRepository } from "../repositories/userRepository";
import { throwError } from "../helpers/errorHelper";

dotenv.config();

export class AuthService {
  private repository: UserRepository;

  constructor() {
    this.repository = new UserRepository();
  }

  public async signUp(input: InputAuthSignUpInterface): Promise<AuthResponseInterface> {
    const { email, password, name, userType } = input;

    /**Check if email already exists for user**/
    const existingUser = await  this.repository.findOne({ where: {email} });
    if (existingUser) {
        throwError(`User with email ${email} already exists.`, "BAD_USER_INPUT", 404);
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.PASSWORD_HASH_CONSTANT!));

    const user = await  this.repository.create({email, passwordHash: hashedPassword, fullName: name, userType});

    const {accessToken, refreshToken} = signToken(
      user.id,
      user.userType
    )

    return ({
        user,
        token :{
          access: accessToken,
          refresh: refreshToken
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

    return {
      user,
      token: {
        access: accessToken,
        refresh: refreshToken,
      },
    };
  }
}
