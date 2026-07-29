import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputPasswordResetTokenInterface {
    userId: string;
    codeHash: string;
    expiresAt: Date;
    usedAt?: Date | null;
}

export interface PasswordResetTokenInterface extends ModelTimestampExtend, InputPasswordResetTokenInterface {
    id: string;
}

export interface PasswordResetTokenModelInterface
    extends Sequelize.Model<PasswordResetTokenInterface, Partial<InputPasswordResetTokenInterface>>,
        PasswordResetTokenInterface {}
