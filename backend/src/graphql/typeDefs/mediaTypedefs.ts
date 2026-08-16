import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const mediaTypedefs: DocumentNode = gql`
    #graphql

    enum MediaKindEnum {
        PHOTO
        AVATAR
        COVER
    }

    # REVIEW exists for doc 3's full polymorphic shape (review photo galleries,
    # a later ticket) - MediaService rejects it until that ticket lands.
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
        # Required for PLACE (the place being photographed); ignored for USER
        # (always the caller's own account - never trust a client-supplied id
        # there).
        ownerId: Int
        kind: MediaKindEnum!
        url: String!
    }

    extend type Query {
        # ownerId required for PLACE, ignored for USER (self).
        mediaUploadSignature(ownerType: MediaOwnerTypeEnum!, kind: MediaKindEnum!, ownerId: Int): UploadSignatureResponse
    }

    extend type Mutation {
        attachMedia(input: InputAttachMedia!): AttachMediaResponse
        removeMedia(mediaId: Int!): Message
    }
`
