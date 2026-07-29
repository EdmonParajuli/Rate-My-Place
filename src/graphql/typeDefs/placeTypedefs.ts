import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const placeDefs: DocumentNode = gql`
    #graphql

    input InputPlace {
        label: String
        description: String
        address: String
        phone: String
        website: String
        categoryId: Int 
    }

    type Place {
        id: Int
        owner: User
        label: String
        description: String
        address: String
        phone: String
        website: String
        category: String
        averageRating: Int
        reviewCount: Int
        isVerified: Boolean
    }

    type PlaceResponse {
        message: String
        data: Place
    }

    extend type Query {
        getPlaceById(id: Int!): PlaceResponse
    }

    extend type Mutation {
        createPlace(input: InputPlace): PlaceResponse
    }
`