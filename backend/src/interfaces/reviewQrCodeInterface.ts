import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputReviewQrCodeInterface {
    placeId: number;
    publicToken: string;
    isActive?: boolean;
    createdBy: string;
}

export interface ReviewQrCodeInterface extends ModelTimestampExtend, InputReviewQrCodeInterface {
    id: number;
    isActive: boolean;
}

export interface ReviewQrCodeModelInterface
    extends Sequelize.Model<ReviewQrCodeInterface, Partial<InputReviewQrCodeInterface>>,
        ReviewQrCodeInterface {}
