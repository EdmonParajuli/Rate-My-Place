import * as Sequelize  from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";

export interface InputPlaceInterface {
      label: string,
      description?: string,
      address: string,
      phone: string,
      website?: string,
      categoryId?: number
      ownerId: string,
}

export interface PlaceInterface extends ModelTimestampExtend, InputPlaceInterface {
      id: string,
      averageRating?: number,
      reviewCount?: number,
      isVerified?: boolean,
}

export interface PlaceModelInterface extends Sequelize.Model<PlaceInterface, Partial<InputPlaceInterface>>, PlaceInterface{}