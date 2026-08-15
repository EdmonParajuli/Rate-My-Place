import PlaceService from './placeService';
import { ReviewService } from './reviewService';
import { ReviewReplyService } from './reviewReplyService';
import { throwError } from '../helpers/errorHelper';
import { computeDashboardStats } from './businessDashboardMath';

// Orchestration-only, same shape as PlatformStatsService - composes the
// three existing services (each still owns exactly one repository) rather
// than reaching into PlaceRepository/ReviewRepository/ReviewReplyRepository
// directly. Two lightweight fetches (reviews, replies), everything else is
// computed in memory by businessDashboardMath - see
// docs/specs/phase-6-business-dashboard.md.
export class BusinessDashboardService {
  private placeService: PlaceService;
  private reviewService: ReviewService;
  private reviewReplyService: ReviewReplyService;

  constructor() {
    this.placeService = new PlaceService();
    this.reviewService = new ReviewService();
    this.reviewReplyService = new ReviewReplyService();
  }

  async getDashboard(ownerId: string) {
    const place = await this.placeService.getByOwnerId(ownerId);
    if (!place) {
      throwError("You don't have a business listing yet.", "NOT_FOUND", 404);
    }

    const reviews = await this.reviewService.getForDashboard(place!.id);
    const replies = await this.reviewReplyService.getForReviews(reviews.map((r) => r.id));

    const stats = computeDashboardStats(reviews, replies, new Date());

    return {
      placeId: place!.id,
      placeName: place!.label,
      ...stats,
    };
  }
}
