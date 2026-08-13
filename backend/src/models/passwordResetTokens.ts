import * as Sequelize from "sequelize";
import { Database } from "../config";
import { PasswordResetTokenModelInterface } from "../interfaces/passwordResetTokenInterface";

const sequelize = Database.sequelize;

const PasswordResetToken = sequelize.define<PasswordResetTokenModelInterface>(
    'providers_password_reset_tokens',
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
        codeHash: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            field: "code_hash"
        },
        expiresAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: "expires_at"
        },
        usedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "used_at"
        }
    },
    {
        tableName: "providers_password_reset_tokens",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default PasswordResetToken;
