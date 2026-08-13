import * as Sequelize from "sequelize";

export interface InputReviewVoteInterface {
    reviewId: number;
    userId: string;
}

export interface ReviewVoteInterface extends InputReviewVoteInterface {
    id: string;
    createdAt?: Date;
}

export interface ReviewVoteModelInterface extends Sequelize.Model<ReviewVoteInterface, Partial<InputReviewVoteInterface>>, ReviewVoteInterface {}
