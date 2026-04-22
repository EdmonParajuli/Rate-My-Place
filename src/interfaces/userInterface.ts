import * as Sequelize from 'sequelize';
import { UserTypeEnum } from "../enums/userTypesEnum";
import { ModelTimestampExtend } from "./modelTimeStampInterface";


export interface InputUserInterface {
    email: string;
    passwordHash: string;
    phoneNumber?:string;
    fullName: string;
    userType: UserTypeEnum;
    profilePicture?: string;
}

export interface UserInterface extends ModelTimestampExtend, InputUserInterface {
    id: Sequelize.CreationOptional <number>;
}

export interface UserModelInterface extends Sequelize.Model<UserInterface, Partial<InputUserInterface>>,UserInterface{}