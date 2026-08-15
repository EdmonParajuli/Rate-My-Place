import * as Sequelize from "sequelize";
import { Database } from "../config";
import { BadgeModelInterface } from "../interfaces/badgeInterface";
import { BadgeKeyEnum } from "../enums/badgeKeyEnum";

const sequelize = Database.sequelize;

const Badge = sequelize.define<BadgeModelInterface>(
    'providers_badges',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        key: {
            type: Sequelize.ENUM(...Object.values(BadgeKeyEnum)),
            allowNull: false,
            unique: true
        },
        label: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        icon: {
            type: Sequelize.STRING,
            allowNull: false
        }
    },
    {
        tableName: "providers_badges",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default Badge;
