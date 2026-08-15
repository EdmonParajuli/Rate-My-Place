import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const savedPlaceTypedefs: DocumentNode = gql`
    #graphql

    enum SavedListTypeEnum {
        SAVED
        WANT_TO_VISIT
        FAVORITE
    }

    # Deliberately no REVIEWED value here - Saved -> Reviewed is derived live
    # from a user's review history (myReviews), never stored in
    # providers_saved_places. See docs/specs/phase-5-saved-places.md.
    enum SavedPlaceFilterEnum {
        ALL
        WANT_TO_VISIT
        FAVORITE
    }

    type SavedPlace {
        id: Int
        placeId: Int
        place: Place
        listType: SavedListTypeEnum
        createdAt: String
    }

    type SavedPlaceListResponse {
        message: String
        data: [SavedPlace]
    }

    type SavedPlaceResponse {
        message: String
        data: SavedPlace
    }

    type ToggleSavePlaceResponse {
        message: String
        savedByMe: Boolean
        listType: SavedListTypeEnum
    }

    extend type Place {
        savedByMe: Boolean
        savedListType: SavedListTypeEnum
    }

    extend type Query {
        savedPlaces(filter: SavedPlaceFilterEnum): SavedPlaceListResponse
    }

    extend type Mutation {
        toggleSavePlace(placeId: Int!): ToggleSavePlaceResponse
        setSavedPlaceListType(placeId: Int!, listType: SavedListTypeEnum!): SavedPlaceResponse
    }
`
