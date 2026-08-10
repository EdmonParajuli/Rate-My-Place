import * as Sequelize from "sequelize";

export interface InputPlaceHourInterface {
    placeId: number;
    dayOfWeek: number;
    opensAt: string;
    closesAt: string;
}

export interface PlaceHourInterface extends InputPlaceHourInterface {
    id: string;
    createdAt?: Date;
}

export interface PlaceHourModelInterface extends Sequelize.Model<PlaceHourInterface, Partial<InputPlaceHourInterface>>, PlaceHourInterface {}
