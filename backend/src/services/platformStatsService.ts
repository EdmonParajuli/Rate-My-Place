import PlaceService from './placeService';
import { ReviewService } from './reviewService';

// Orchestration-only - composes the two existing services (each still owns
// exactly one repository) rather than a new service reaching into both
// PlaceRepository and ReviewRepository directly. Two independent counts, no
// shared write transaction, so this doesn't carry the cross-repository
// complication docs/03-architecture.md flags for signUpBusiness.
export class PlatformStatsService {
  private placeService: PlaceService;
  private reviewService: ReviewService;

  constructor() {
    this.placeService = new PlaceService();
    this.reviewService = new ReviewService();
  }

  async getStats(): Promise<{ totalPlaces: number; totalReviews: number }> {
    const [totalPlaces, totalReviews] = await Promise.all([
      this.placeService.countAll(),
      this.reviewService.countAll(),
    ]);

    return { totalPlaces, totalReviews };
  }
}
