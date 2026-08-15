import * as Sequelize from "sequelize";
import { Database } from "../config";
import { NotificationModelInterface } from "../interfaces/notificationInterface";
import { NotificationTypeEnum } from "../enums/notificationTypeEnum";

const sequelize = Database.sequelize;

const Notification = sequelize.define<NotificationModelInterface>(
    'providers_notifications',
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
        type: {
            type: Sequelize.ENUM(...Object.values(NotificationTypeEnum)),
            allowNull: false
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        placeId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: "providers_places",
                key: "id"
            },
            field: "place_id"
        },
        read: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    },
    {
        tableName: "providers_notifications",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default Notification;
