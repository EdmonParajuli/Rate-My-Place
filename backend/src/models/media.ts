import * as Sequelize from "sequelize";
import { Database } from "../config";
import { MediaModelInterface } from "../interfaces/mediaInterface";
import { MediaOwnerTypeEnum } from "../enums/mediaOwnerTypeEnum";
import { MediaKindEnum } from "../enums/mediaKindEnum";

const sequelize = Database.sequelize;

const Media = sequelize.define<MediaModelInterface>(
    'providers_media',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        ownerType: {
            type: Sequelize.ENUM(...Object.values(MediaOwnerTypeEnum)),
            allowNull: false,
            field: "owner_type"
        },
        ownerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            field: "owner_id"
        },
        url: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        kind: {
            type: Sequelize.ENUM(...Object.values(MediaKindEnum)),
            allowNull: false
        }
    },
    {
        tableName: "providers_media",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default Media;
