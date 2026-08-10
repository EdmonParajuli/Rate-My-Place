import * as Sequelize from "sequelize";
import { Database } from "../config";
import { PlaceHourModelInterface } from "../interfaces/placeHourInterface";

const sequelize = Database.sequelize;

const PlaceHour = sequelize.define<PlaceHourModelInterface>(
    'providers_place_hours',
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
        dayOfWeek: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 6
            },
            field: "day_of_week"
        },
        opensAt: {
            type: Sequelize.TIME,
            allowNull: false,
            field: "opens_at"
        },
        closesAt: {
            type: Sequelize.TIME,
            allowNull: false,
            field: "closes_at"
        }
    },
    {
        tableName: "providers_place_hours",
        paranoid: false,
        timestamps: true,
        updatedAt: false,
        underscored: true,
        freezeTableName: true
    }
)

export default PlaceHour;
