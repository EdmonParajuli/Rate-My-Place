import * as Sequelize from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputCategoryInterface {
    label: string;
    description: string;
    icon?: string;
}

export interface CategoryInterface extends ModelTimestampExtend, InputCategoryInterface {
    id: string;
}

export interface CategoryModelInterface extends Sequelize.Model<CategoryInterface, Partial<InputCategoryInterface>>, CategoryInterface {}
