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
        latitude: Float
        longitude: Float
    }

    enum PlaceSortEnum {
        NEW
        NEAREST
    }

    input GeoInput {
        latitude: Float!
        longitude: Float!
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
        averageRating: Float
        reviewCount: Int
        isVerified: Boolean
        latitude: Float
        longitude: Float
        distance: Float
    }

    type PlaceResponse {
        message: String
        data: Place
    }

    type PlaceListResponse {
        message: String
        data: [Place]
        pageInfo: PageInfo
    }

    extend type Query {
        getPlaceById(id: Int!): PlaceResponse
        listPlaces(sort: PlaceSortEnum, near: GeoInput, first: Int, after: String): PlaceListResponse
    }

    extend type Mutation {
        createPlace(input: InputPlace): PlaceResponse
        updatePlace(placeId: Int!, input: InputPlace): PlaceResponse
        deletePlace(placeId: Int!): Message
    }
`