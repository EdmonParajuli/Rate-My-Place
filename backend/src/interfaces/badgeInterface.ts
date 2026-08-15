import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";
import { BadgeKeyEnum } from "../enums/badgeKeyEnum";

export interface InputBadgeInterface {
    key: BadgeKeyEnum;
    label: string;
    description: string;
    icon: string;
}

export interface BadgeInterface extends ModelTimestampExtend, InputBadgeInterface {
    id: string;
}

export interface BadgeModelInterface extends Sequelize.Model<BadgeInterface, Partial<InputBadgeInterface>>, BadgeInterface {}
