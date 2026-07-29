import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const authTypedefs: DocumentNode = gql`
#graphql

    type Message {
        message: String
    }

    type User {
        id: Int
        email: String
        phoneNumber: String
        fullName: String
        userType: UserTypeEnum
        profilePicture: String 
    }

    enum UserTypeEnum {
        REGULAR
        BUSINESS
    }

    input InputAuthSignUp {
        name: String
        email: String
        password: String
        userType: UserTypeEnum
    }

    input InputChangePassword {
        previousPassword: String!
        newPassword: String!
        confirmNewPassword: String!
        refreshToken: String
    }

    input InputAuthLogin {
        email: String
        password: String
    }

    input InputForgotPassword {
        email: String!
    }

    input InputConfirmForgotPassword {
        newPassword: String!
        verificationCode: String!
        email: String!
    }

    input InputRefreshToken {
        refreshToken: String!
    }

    type SignUpData {
        email: String
        userType: UserTypeEnum
    }

    type SignUpResponse {
        message: String
        data: SignUpData
    }

    type LoginToken { 
        access: String
        refresh: String
    }

    type UserData {
        user: User
        token : LoginToken
    }

    type LoginResponse {
        message: String
        data: UserData
    }

    type AuthMeResponse {
        message: String
        data: User
    }

    type authMeUserResponse {
        message: String
        data: User
    }

    extend type Mutation {
        signUp(input: InputAuthSignUp): SignUpResponse
        login(input: InputAuthLogin): LoginResponse
        signOut(input: InputRefreshToken): Message
        forgotPassword(input: InputForgotPassword!): Message
        changePassword(input: InputChangePassword!): Message
        confirmForgotPassword(input: InputConfirmForgotPassword!): Message
    }

    extend type Query {
        authMeUser: authMeUserResponse
    }

`