import * as Sequelize  from "sequelize";
import { Database } from "../config";
import { PlaceModelInterface } from "../interfaces/placeInterface";

const sequelize = Database.sequelize;

const Place = sequelize.define<PlaceModelInterface>(
    'providers_places',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
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
        label: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        address: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        phone: {
            type: Sequelize.STRING,
            allowNull: false
        },
        website: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        categoryId: {
            type: Sequelize.INTEGER,
            references: {
                model: "providers_categories",
                key: "id"
            },
            field: "category_id"
        },
        averageRating: {
            type: Sequelize.DECIMAL(2, 1),
            allowNull: true,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 5
            },
            field: "average_rating"
        },
        reviewCount: {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: "review_count"
        },
        isVerified: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
            defaultValue: false,
            field: "is_verified"
        },
        latitude: {
            type: Sequelize.DECIMAL(9, 6),
            allowNull: true
        },
        longitude: {
            type: Sequelize.DECIMAL(9, 6),
            allowNull: true
        },
        priceRange: {
            type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
            allowNull: true,
            field: "price_range"
        },
        trendingScore: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: "trending_score"
        }
    },
    {   
        tableName: "providers_places",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default Place;
