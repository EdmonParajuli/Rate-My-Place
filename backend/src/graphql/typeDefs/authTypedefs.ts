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
        # Epoch-millisecond String, same convention as every other date on this
        # schema (Review.createdAt, Badge.earnedAt, ...) - resolves via default
        # field resolution off the model instance returned by authMeUser/login/
        # signUp, no resolver change needed.
        createdAt: String
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

    # fullName only - see User.createdAt's neighbor comment; email edit is
    # deliberately out of scope (no email-verification flow exists yet).
    input InputUpdateUser {
        fullName: String!
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

    # Flat, not nested under a place key - mirrors InputSignUpBusinessInterface.
    # userType isn't an input field here - it's implied BUSINESS.
    input InputSignUpBusiness {
        name: String
        email: String
        password: String
        label: String
        description: String
        address: String
        phone: String
        website: String
        categoryId: Int
        priceRange: PriceRangeEnum
    }

    type LoginToken {
        access: String
        refresh: String
    }

    type UserData {
        user: User
        token : LoginToken
    }

    # Reuses UserData - AuthService.signUp has always returned {user, token}
    # (same as login), this type just didn't match that until now. No resolver
    # change needed, only this SDL fix.
    type SignUpResponse {
        message: String
        data: UserData
    }

    type LoginResponse {
        message: String
        data: UserData
    }

    type AuthMeResponse {
        message: String
        data: User
    }

    type SignUpBusinessData {
        user: User
        place: Place
        token: LoginToken
    }

    type SignUpBusinessResponse {
        message: String
        data: SignUpBusinessData
    }

    type authMeUserResponse {
        message: String
        data: User
    }

    type UpdateUserResponse {
        message: String
        data: User
    }

    extend type Mutation {
        signUp(input: InputAuthSignUp): SignUpResponse
        signUpBusiness(input: InputSignUpBusiness): SignUpBusinessResponse
        login(input: InputAuthLogin): LoginResponse
        signOut(input: InputRefreshToken): Message
        forgotPassword(input: InputForgotPassword!): Message
        changePassword(input: InputChangePassword!): Message
        confirmForgotPassword(input: InputConfirmForgotPassword!): Message
        updateUser(input: InputUpdateUser!): UpdateUserResponse
    }

    extend type Query {
        authMeUser: authMeUserResponse
    }

`