import * as Sequelize from "sequelize";
import { Database } from "../config";
import { ReviewQrCodeModelInterface } from "../interfaces/reviewQrCodeInterface";

const sequelize = Database.sequelize;

const ReviewQrCode = sequelize.define<ReviewQrCodeModelInterface>(
    'providers_review_qr_codes',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        publicToken: {
            type: Sequelize.STRING,
            allowNull: false,
            field: "public_token"
        },
        isActive: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            field: "is_active"
        },
        createdBy: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_users",
                key: "id"
            },
            field: "created_by"
        }
    },
    {
        tableName: "providers_review_qr_codes",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default ReviewQrCode;
