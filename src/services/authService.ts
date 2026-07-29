import { GraphQLError } from "graphql";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { InputAuthLoginInterface, InputAuthSignUpInterface, AuthResponseInterface, ContextInterface } from "../interfaces";
import { signToken } from "../utils/jwt";
import { UserRepository } from "../repositories/userRepository";

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
      throw new GraphQLError("Invalid email or password",{
        extensions :{
          code: "UNAUTHENTICATED",
          status: 401
        }
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if(!isPasswordValid){
      throw new GraphQLError("Invalid email or password",{
        extensions :{
          code: 'UNAUTHENTICATED',
          status: 401
        }
      })
    }

    const {accessToken, refreshToken} = signToken(
      user.id,
      user.userType
    )

    context.user = user;
    
    return {
      user,
      token: {
        access: accessToken,
        refresh: refreshToken,
      },
    };
  }
}
