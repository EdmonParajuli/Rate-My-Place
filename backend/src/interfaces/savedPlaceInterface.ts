import * as Sequelize from "sequelize";
import { SavedListTypeEnum } from "../enums/savedListTypeEnum";

export interface InputSavedPlaceInterface {
    userId: string;
    placeId: number;
    listType?: SavedListTypeEnum;
}

export interface SavedPlaceInterface extends InputSavedPlaceInterface {
    id: string;
    listType: SavedListTypeEnum;
    createdAt?: Date;
}

export interface SavedPlaceModelInterface extends Sequelize.Model<SavedPlaceInterface, Partial<InputSavedPlaceInterface>>, SavedPlaceInterface {}
