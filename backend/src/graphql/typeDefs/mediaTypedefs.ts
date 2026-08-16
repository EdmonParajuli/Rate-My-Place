import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const mediaTypedefs: DocumentNode = gql`
    #graphql

    # PHOTO exists for doc 3's full polymorphic shape (place/review photo
    # galleries, a later ticket) - attachMedia only accepts AVATAR/COVER today.
    enum MediaKindEnum {
        PHOTO
        AVATAR
        COVER
    }

    type Media {
        id: Int
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
        kind: MediaKindEnum!
        url: String!
    }

    extend type Query {
        # Always for the caller's own avatar/cover - no ownerId, self only.
        mediaUploadSignature(kind: MediaKindEnum!): UploadSignatureResponse
    }

    extend type Mutation {
        attachMedia(input: InputAttachMedia!): AttachMediaResponse
    }
`
