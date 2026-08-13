import * as Sequelize from "sequelize";
import { Database } from "../config";
import { ReviewVoteModelInterface } from "../interfaces/reviewVoteInterface";

const sequelize = Database.sequelize;

const ReviewVote = sequelize.define<ReviewVoteModelInterface>(
    'providers_review_votes',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        reviewId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_reviews",
                key: "id"
            },
            field: "review_id"
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_users",
                key: "id"
            },
            field: "user_id"
        }
    },
    {
        tableName: "providers_review_votes",
        paranoid: false,
        timestamps: true,
        updatedAt: false,
        underscored: true,
        freezeTableName: true
    }
)

export default ReviewVote;
