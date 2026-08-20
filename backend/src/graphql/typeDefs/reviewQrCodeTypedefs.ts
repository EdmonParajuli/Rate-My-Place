import { DocumentNode } from "graphql";
import gql from "graphql-tag";

export const reviewQrCodeTypedefs: DocumentNode = gql`
    #graphql

    type ReviewQrCode {
        publicToken: String
        createdAt: String
    }

    type ReviewQrCodeResponse {
        message: String
        data: ReviewQrCode
    }

    extend type Query {
        # Get-or-create, not "generate" - always returns the caller's one
        # active QR, silently creating it on first call. No mutation exists -
        # regeneration isn't self-service (docs/specs/phase-11-qr-review-flow.md).
        myReviewQrCode: ReviewQrCodeResponse
    }
`
