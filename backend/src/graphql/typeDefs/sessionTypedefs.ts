import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const sessionTypedefs: DocumentNode = gql`
    #graphql

    type Session {
        id: Int
        deviceLabel: String
        ipAddress: String
        createdAt: String
        lastUsedAt: String
    }

    type ActiveSessionsResponse {
        message: String
        data: [Session]
    }

    type RefreshTokenResponse {
        message: String
        data: LoginToken
    }

    input InputRefreshAccessToken {
        refreshToken: String!
    }

    extend type Mutation {
        refreshAccessToken(input: InputRefreshAccessToken!): RefreshTokenResponse
        revokeSession(sessionId: Int!): Message
    }

    extend type Query {
        activeSessions: ActiveSessionsResponse
    }
`
