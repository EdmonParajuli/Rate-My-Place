import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputReviewReplyInterface {
    description: string;
    reviewId: number;
    ownerId: string;
}

export interface ReviewReplyInterface extends ModelTimestampExtend, InputReviewReplyInterface {
    id: string;
}

export interface ReviewReplyModelInterface extends Sequelize.Model<ReviewReplyInterface, Partial<InputReviewReplyInterface>>, ReviewReplyInterface {}
