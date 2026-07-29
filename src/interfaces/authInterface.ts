import { UserTypeEnum } from "../enums/userTypesEnum"
import { UserInterface } from "./userInterface"

export interface InputAuthSignUpInterface {
    email: string,
    password: string,
    name: string,
    userType: UserTypeEnum,
}

export interface InputAuthLoginInterface {
    email: string,
    password: string
}

export interface AuthResponseInterface {
    user: UserInterface,
    token: {
        access: string;
        refresh: string;
      };
}