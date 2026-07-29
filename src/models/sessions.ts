import * as Sequelize from "sequelize";
import { Database } from "../config";
import { SessionModelInterface } from "../interfaces/sessionInterface";

const sequelize = Database.sequelize;

const Session = sequelize.define<SessionModelInterface>(
    'providers_sessions',
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
        refreshTokenHash: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            field: "refresh_token_hash"
        },
        deviceLabel: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "device_label"
        },
        userAgent: {
            type: Sequelize.TEXT,
            allowNull: true,
            field: "user_agent"
        },
        ipAddress: {
            type: Sequelize.STRING,
            allowNull: true,
            field: "ip_address"
        },
        lastUsedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "last_used_at"
        },
        expiresAt: {
            type: Sequelize.DATE,
            allowNull: false,
            field: "expires_at"
        },
        revokedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            field: "revoked_at"
        }
    },
    {
        tableName: "providers_sessions",
        paranoid: true,
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
)

export default Session;
