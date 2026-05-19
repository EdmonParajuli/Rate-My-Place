import { UserTypeEnum } from "../enums/userTypesEnum"

export interface InputAuthSignUpInterface {
    email: string,
    password: string,
    name: string,
    userType: UserTypeEnum,
}

export interface SignUpResponseInterface {
    id: string,
    email: string,
    fullName: string,
    userType: UserTypeEnum,
    accessToken: string,
    refreshToken: string
}