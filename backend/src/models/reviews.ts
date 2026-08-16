import * as Sequelize from "sequelize";
import { Database } from "../config";
import { ReviewModelInterface } from "../interfaces/reviewInterface";

const sequelize = Database.sequelize;

const Review = sequelize.define<ReviewModelInterface>(
    'providers_reviews',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        review: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        placeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_places",
                key: "id"
            },
            field: "place_id"
        },
        reviewerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_users",
                key: "id"
            },
            field: "reviewer_id"
        },
        rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
                isInt: true
            }
        },
        helpfulCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "helpful_count"
        },
        photoCount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "photo_count"
        }
    },
    {
        tableName: "providers_reviews",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default Review;
