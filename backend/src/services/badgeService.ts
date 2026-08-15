import { BadgeRepository } from '../repositories/badgeRepository';
import { UserBadgeRepository } from '../repositories/userBadgeRepository';
import { ReviewService } from './reviewService';
import { BadgeInterface } from '../interfaces/badgeInterface';
import { BadgeKeyEnum } from '../enums/badgeKeyEnum';

interface ReviewerStats {
  reviewCount: number;
  helpfulVotesReceived: number;
  distinctPlacesReviewed: number;
}

// Small hardcoded map, not a designer-configurable rules engine - same "start
// simple" precedent businessDashboardMath.ts's reputation-score formula
// already set. Every criterion is derived from ReviewService.getReviewerStats,
// the same 3 numbers StatsRow.tsx already computes client-side.
const CRITERIA: Record<BadgeKeyEnum, (stats: ReviewerStats) => boolean> = {
  [BadgeKeyEnum.FIRST_REVIEW]: (stats) => stats.reviewCount >= 1,
  [BadgeKeyEnum.PROLIFIC_REVIEWER]: (stats) => stats.reviewCount >= 10,
  [BadgeKeyEnum.HELPFUL_REVIEWER]: (stats) => stats.helpfulVotesReceived >= 10,
  [BadgeKeyEnum.EXPLORER]: (stats) => stats.distinctPlacesReviewed >= 5,
  [BadgeKeyEnum.ELITE_REVIEWER]: (stats) => stats.reviewCount >= 10 && stats.helpfulVotesReceived >= 25,
};

export class BadgeService {
  private repository: BadgeRepository;
  private userBadgeRepository: UserBadgeRepository;
  private reviewService: ReviewService;

  constructor() {
    this.repository = new BadgeRepository();
    this.userBadgeRepository = new UserBadgeRepository();
    this.reviewService = new ReviewService();
  }

  // Check-on-read, not hooked into createReview/deleteReview/toggleHelpfulVote -
  // badges are awarded (and persisted, permanently - see
  // docs/specs/phase-5-badges.md) whenever this runs, not the instant the
  // triggering review/vote is written. Once a UserBadge row exists it's never
  // removed, even if the underlying stats later drop back below threshold.
  async getForUser(userId: string): Promise<(BadgeInterface & { earned: boolean; earnedAt: Date | null })[]> {
    const [catalog, earnedBadges, stats] = await Promise.all([
      this.repository.findAll({ where: {}, order: [['id', 'ASC']] }),
      this.userBadgeRepository.findAll({ where: { userId } }),
      this.reviewService.getReviewerStats(userId),
    ]);

    const earnedByBadgeId = new Map(earnedBadges.map((userBadge) => [String(userBadge.badgeId), userBadge]));

    const newlyEarned = catalog.filter((badge) => {
      return !earnedByBadgeId.has(String(badge.id)) && CRITERIA[badge.key](stats);
    });

    if (newlyEarned.length > 0) {
      const earnedAt = new Date();
      const created = await Promise.all(
        newlyEarned.map((badge) => this.userBadgeRepository.create({ userId, badgeId: Number(badge.id), earnedAt }))
      );
      created.forEach((userBadge) => earnedByBadgeId.set(String(userBadge.badgeId), userBadge));
    }

    return catalog.map((badge) => {
      const earned = earnedByBadgeId.get(String(badge.id));
      // .get({ plain: true }) is required here, not a bare spread - badge is
      // a live Sequelize instance and {...badge} doesn't reliably pick up its
      // getter-defined attributes, unlike returning the instance itself
      // untouched (which every other resolver in this codebase does).
      return {
        ...(badge as any).get({ plain: true }),
        earned: !!earned,
        earnedAt: earned?.earnedAt ?? null,
      };
    });
  }
}
