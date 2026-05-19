import { DocumentNode } from "graphql";
import gql from 'graphql-tag';

export const userDefs: DocumentNode = gql `
    #graphql

    enum UserTypeEnum {
        REGULAR
        BUSINESS
    }

    type Message {
        message: String
    }

    input InputUser {
        email: String
        phoneNumber: String
        fullName: String
        userType: UserTypeEnum
        profilePicture: String
    }

    type SingleUserResponse {
        message: String
        data: User
    }

    type UsersResponse {
        message: String
        data: [SingleUser]
    }

    extend type Mutation {
        createUser(input: InputUser!) : SingleUserResponse
        updateUser(id: Int, input: InputUser) : SingleUserResponse
        deleteUser(id: Int!): Message
    }

    extend type Query {
        users: UsersResponse
        user(id: Int!): SingleUserResponse
    }

`