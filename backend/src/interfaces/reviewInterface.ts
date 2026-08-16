import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputReviewInterface {
    review: string;
    rating: number;
    placeId: number;
    reviewerId: string;
    // Not part of the public create/update GraphQL input - only written by
    // ReviewService.updateHelpfulCount via the repository's generic updateOne,
    // same pattern as Place.averageRating/reviewCount.
    helpfulCount?: number;
    // Not part of the public create/update GraphQL input either - only
    // written by ReviewService.updatePhotoCount (MediaService.attachMedia/
    // removeMedia). See docs/specs/phase-8-media-plumbing.md.
    photoCount?: number;
}

export interface ReviewInterface extends ModelTimestampExtend, InputReviewInterface {
    id: string;
}

export interface ReviewModelInterface extends Sequelize.Model<ReviewInterface, Partial<InputReviewInterface>>, ReviewInterface {}
