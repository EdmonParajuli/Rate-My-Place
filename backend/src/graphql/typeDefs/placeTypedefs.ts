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
        priceRange: PriceRangeEnum
    }

    enum PlaceSortEnum {
        NEW
        NEAREST
        HIGHEST_RATED
        TRENDING
    }

    enum PriceRangeEnum {
        LOW
        MEDIUM
        HIGH
    }

    input GeoInput {
        latitude: Float!
        longitude: Float!
    }

    input PlaceFilterInput {
        openNow: Boolean
        categoryId: Int
        priceRange: PriceRangeEnum
        minRating: Float
        query: String
    }

    input InputPlaceHour {
        dayOfWeek: Int!
        opensAt: String!
        closesAt: String!
    }

    type PlaceHour {
        id: Int
        dayOfWeek: Int
        opensAt: String
        closesAt: String
    }

    type RatingBreakdownEntry {
        stars: Int
        count: Int
    }

    type PlaceHoursResponse {
        message: String
        data: [PlaceHour]
    }

    type Place {
        id: Int
        owner: User @complexity(value: 2)
        label: String
        description: String
        address: String
        phone: String
        website: String
        category: Category @complexity(value: 2)
        averageRating: Float
        reviewCount: Int
        isVerified: Boolean
        latitude: Float
        longitude: Float
        distance: Float
        priceRange: PriceRangeEnum
        hours: [PlaceHour] @complexity(value: 2)
        openNow: Boolean @complexity(value: 2)
        ratingBreakdown: [RatingBreakdownEntry] @complexity(value: 2)
        trendingScore: Float
        # Denormalized read cache, kept in sync by MediaService whenever the
        # owner sets/removes a COVER media row - see
        # docs/specs/phase-8-media-plumbing.md.
        coverPhotoUrl: String
        # Live per-place lookup (not denormalized - only ever requested for
        # one place at a time, no N+1 risk the way coverPhotoUrl had on
        # Discover's grid). Owner-uploaded gallery, kind PHOTO only.
        photos: [Media] @complexity(value: 2)
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
        listPlaces(sort: PlaceSortEnum, near: GeoInput, filter: PlaceFilterInput, first: Int, after: String): PlaceListResponse @complexity(value: 1, multipliers: ["first"])
    }

    extend type Mutation {
        createPlace(input: InputPlace): PlaceResponse
        updatePlace(placeId: Int!, input: InputPlace): PlaceResponse
        deletePlace(placeId: Int!): Message
        setPlaceHours(placeId: Int!, hours: [InputPlaceHour!]!): PlaceHoursResponse
    }
`