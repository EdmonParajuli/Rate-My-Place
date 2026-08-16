import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";
import { MediaOwnerTypeEnum } from "../enums/mediaOwnerTypeEnum";
import { MediaKindEnum } from "../enums/mediaKindEnum";

export interface InputMediaInterface {
    ownerType: MediaOwnerTypeEnum;
    ownerId: number;
    url: string;
    kind: MediaKindEnum;
}

export interface MediaInterface extends ModelTimestampExtend, InputMediaInterface {
    id: string;
}

export interface MediaModelInterface extends Sequelize.Model<MediaInterface, Partial<InputMediaInterface>>, MediaInterface {}
