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
      // Not part of the public create/update GraphQL input - only written by
      // PlaceService.recomputeRatingStats via the repository's generic updateOne.
      averageRating?: number,
      reviewCount?: number,
      latitude?: number,
      longitude?: number,
}

export interface PlaceInterface extends ModelTimestampExtend, InputPlaceInterface {
      id: string,
      averageRating?: number,
      reviewCount?: number,
      isVerified?: boolean,
      // Only present on rows returned by PlaceRepository.paginateByDistance -
      // undefined (resolves GraphQL null) for every other query path.
      distance?: number,
}

export interface PlaceModelInterface extends Sequelize.Model<PlaceInterface, Partial<InputPlaceInterface>>, PlaceInterface{}