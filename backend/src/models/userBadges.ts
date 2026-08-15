import * as Sequelize from "sequelize";
import { Database } from "../config";
import { UserBadgeModelInterface } from "../interfaces/userBadgeInterface";

const sequelize = Database.sequelize;

const UserBadge = sequelize.define<UserBadgeModelInterface>(
    'providers_user_badges',
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
        badgeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: "providers_badges",
                key: "id"
            },
            field: "badge_id"
        },
        earnedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: "earned_at"
        }
    },
    {
        tableName: "providers_user_badges",
        paranoid: false,
        timestamps: true,
        updatedAt: false,
        underscored: true,
        freezeTableName: true
    }
)

export default UserBadge;
