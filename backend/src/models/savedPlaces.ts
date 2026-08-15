import * as Sequelize from "sequelize";
import { Database } from "../config";
import { SavedPlaceModelInterface } from "../interfaces/savedPlaceInterface";
import { SavedListTypeEnum } from "../enums/savedListTypeEnum";

const sequelize = Database.sequelize;

const SavedPlace = sequelize.define<SavedPlaceModelInterface>(
    'providers_saved_places',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_users",
                key: "id"
            },
            field: "user_id"
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
        listType: {
            type: Sequelize.ENUM(...Object.values(SavedListTypeEnum)),
            allowNull: false,
            defaultValue: SavedListTypeEnum.SAVED,
            field: "list_type"
        }
    },
    {
        tableName: "providers_saved_places",
        paranoid: false,
        timestamps: true,
        updatedAt: false,
        underscored: true,
        freezeTableName: true
    }
)

export default SavedPlace;
