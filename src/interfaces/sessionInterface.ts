import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputSessionInterface {
    userId: string;
    refreshTokenHash: string;
    deviceLabel?: string;
    userAgent?: string;
    ipAddress?: string;
    lastUsedAt?: Date;
    expiresAt: Date;
    revokedAt?: Date | null;
}

export interface SessionInterface extends ModelTimestampExtend, InputSessionInterface {
    id: string;
}

export interface SessionModelInterface extends Sequelize.Model<SessionInterface, Partial<InputSessionInterface>>, SessionInterface {}
