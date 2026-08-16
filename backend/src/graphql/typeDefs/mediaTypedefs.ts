import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const mediaTypedefs: DocumentNode = gql`
    #graphql

    enum MediaKindEnum {
        PHOTO
        AVATAR
        COVER
    }

    enum MediaOwnerTypeEnum {
        PLACE
        USER
        REVIEW
    }

    type Media {
        id: Int
        ownerType: MediaOwnerTypeEnum
        ownerId: Int
        kind: MediaKindEnum
        url: String
        createdAt: String
    }

    # Cloudinary's signed-upload params - the browser POSTs the file directly
    # to Cloudinary using these, so file bytes never pass through this server.
    type UploadSignature {
        signature: String
        timestamp: Int
        apiKey: String
        cloudName: String
        folder: String
    }

    type UploadSignatureResponse {
        message: String
        data: UploadSignature
    }

    type AttachMediaResponse {
        message: String
        data: Media
    }

    input InputAttachMedia {
        ownerType: MediaOwnerTypeEnum!
        # Required for PLACE/REVIEW (which one); ignored for USER (always the
        # caller's own account - never trust a client-supplied id there).
        ownerId: Int
        kind: MediaKindEnum!
        url: String!
    }

    # photoCount needs no field resolver - a real column (materialized by
    # MediaService, same pattern as Review.helpfulCount), safe to select in
    # placeReviews/myReviews' list queries. photos is a live per-review
    # lookup, only safe through the single-review getReviewById query - see
    # docs/specs/phase-8-media-plumbing.md.
    extend type Review {
        photoCount: Int
        photos: [Media]
    }

    extend type Query {
        # ownerId required for PLACE/REVIEW, ignored for USER (self).
        mediaUploadSignature(ownerType: MediaOwnerTypeEnum!, kind: MediaKindEnum!, ownerId: Int): UploadSignatureResponse
    }

    extend type Mutation {
        attachMedia(input: InputAttachMedia!): AttachMediaResponse
        removeMedia(mediaId: Int!): Message
    }
`
