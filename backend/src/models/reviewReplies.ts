import * as Sequelize from "sequelize";
import { Database } from "../config";
import { ReviewReplyModelInterface } from "../interfaces/reviewReplyInterface";

const sequelize = Database.sequelize;

const ReviewReply = sequelize.define<ReviewReplyModelInterface>(
    'providers_reviews_replies',
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
        ownerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_users",
                key: "id"
            },
            field: "owner_id"
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    },
    {
        tableName: "providers_reviews_replies",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default ReviewReply;
