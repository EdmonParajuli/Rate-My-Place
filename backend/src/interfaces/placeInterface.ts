import * as Sequelize  from "sequelize";
import { ModelTimestampExtend } from "./modelTimeStampInterface";
import { PriceRangeEnum } from "../enums/priceRangeEnum";

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
      priceRange?: PriceRangeEnum,
}

export interface PlaceInterface extends ModelTimestampExtend, InputPlaceInterface {
      id: string,
      averageRating?: number,
      reviewCount?: number,
      isVerified?: boolean,
      // Only present on rows returned by PlaceRepository.paginateByDistance -
      // undefined (resolves GraphQL null) for every other query path.
      distance?: number,
      // Not part of the public create/update GraphQL input - only written by
      // the trending-score refresh job (src/jobs/trendingScoreJob.ts).
      trendingScore?: number,
      // Not part of the public create/update GraphQL input - no write path
      // yet (no attachMedia support for PLACE), seeded directly for now. See
      // docs/specs/phase-8-media-plumbing.md.
      coverPhotoUrl?: string,
}

export interface PlaceFilterOptions {
      openNow?: boolean,
      categoryId?: number,
      priceRange?: PriceRangeEnum,
      minRating?: number,
      // Simple ILIKE against Place.label, not full-text search/trigram
      // indexing - see docs/specs/phase-3-discovery.md open question 3.
      query?: string,
}

export interface PlaceModelInterface extends Sequelize.Model<PlaceInterface, Partial<InputPlaceInterface>>, PlaceInterface{}