import * as Sequelize from "sequelize";

export interface InputUserBadgeInterface {
    userId: string;
    badgeId: number;
    earnedAt: Date;
}

export interface UserBadgeInterface extends InputUserBadgeInterface {
    id: string;
    createdAt?: Date;
}

export interface UserBadgeModelInterface extends Sequelize.Model<UserBadgeInterface, Partial<InputUserBadgeInterface>>, UserBadgeInterface {}
