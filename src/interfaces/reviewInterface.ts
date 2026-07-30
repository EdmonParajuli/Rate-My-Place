import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputReviewInterface {
    review: string;
    rating: number;
    placeId: number;
    reviewerId: string;
}

export interface ReviewInterface extends ModelTimestampExtend, InputReviewInterface {
    id: string;
}

export interface ReviewModelInterface extends Sequelize.Model<ReviewInterface, Partial<InputReviewInterface>>, ReviewInterface {}
