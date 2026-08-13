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
}

export interface ReviewInterface extends ModelTimestampExtend, InputReviewInterface {
    id: string;
}

export interface ReviewModelInterface extends Sequelize.Model<ReviewInterface, Partial<InputReviewInterface>>, ReviewInterface {}
