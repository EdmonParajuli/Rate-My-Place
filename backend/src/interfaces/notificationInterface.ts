import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";
import { NotificationTypeEnum } from "../enums/notificationTypeEnum";

export interface InputNotificationInterface {
    userId: string;
    type: NotificationTypeEnum;
    message: string;
    placeId?: number | null;
    read?: boolean;
}

export interface NotificationInterface extends ModelTimestampExtend, InputNotificationInterface {
    id: string;
}

export interface NotificationModelInterface extends Sequelize.Model<NotificationInterface, Partial<InputNotificationInterface>>, NotificationInterface {}
