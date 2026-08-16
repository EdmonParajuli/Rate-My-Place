import {
  computeReputationScore,
  computeDashboardStats,
  DashboardReviewRow,
  DashboardReplyRow,
} from "../../src/services/businessDashboardMath";

describe("computeReputationScore", () => {
  it("returns 0 for a place with no reviews at all", () => {
    expect(
      computeReputationScore({ averageRating: 0, reviewCount: 0, responseRate: 0, recentCount: 0 })
    ).toBe(0);
  });

  it("scores a perfect, well-established, fully-responded place near 100", () => {
    const score = computeReputationScore({
      averageRating: 5,
      reviewCount: 100,
      responseRate: 100,
      recentCount: 5,
    });
    expect(score).toBeGreaterThanOrEqual(95);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("weights rating as the dominant factor over volume/response/recency", () => {
    const highRatingLowEverythingElse = computeReputationScore({
      averageRating: 5,
      reviewCount: 1,
      responseRate: 0,
      recentCount: 0,
    });
    const lowRatingHighEverythingElse = computeReputationScore({
      averageRating: 1,
      reviewCount: 100,
      responseRate: 100,
      recentCount: 5,
    });
    expect(highRatingLowEverythingElse).toBeGreaterThan(lowRatingHighEverythingElse);
  });

  it("gives diminishing returns for review volume - the same +10 reviews matters far less once a place already has 90+", () => {
    const base = { averageRating: 4, responseRate: 50, recentCount: 2 };
    const deltaAtLowVolume =
      computeReputationScore({ ...base, reviewCount: 11 }) - computeReputationScore({ ...base, reviewCount: 1 });
    const deltaAtHighVolume =
      computeReputationScore({ ...base, reviewCount: 101 }) - computeReputationScore({ ...base, reviewCount: 91 });
    expect(deltaAtLowVolume).toBeGreaterThan(deltaAtHighVolume);
    expect(deltaAtHighVolume).toBeLessThanOrEqual(1);
  });
});

describe("computeDashboardStats", () => {
  const PLACE_TZ_NOW = new Date(2026, 7, 16); // 2026-08-16, matches the month reviews are seeded into below

  function review(id: number, rating: number, daysAgo: number): DashboardReviewRow {
    const createdAt = new Date(PLACE_TZ_NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return { id, rating, createdAt };
  }

  function reply(reviewId: number, daysAgo: number): DashboardReplyRow {
    const createdAt = new Date(PLACE_TZ_NOW.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return { reviewId, createdAt };
  }

  it("shows the empty-state insight and zeroed metrics for a place with zero reviews", () => {
    const stats = computeDashboardStats([], [], PLACE_TZ_NOW);

    expect(stats.reviewCount).toBe(0);
    expect(stats.averageRating).toBe(0);
    expect(stats.reputationScore).toBe(0);
    expect(stats.insights).toEqual([
      "You haven't received any reviews yet — once customers start reviewing, insights will appear here.",
    ]);
  });

  it("computes trend deltas against last month's snapshot, not this month's own numbers", () => {
    const reviews = [
      // last month: two reviews, ratings 3 and 3 -> average 3
      review(1, 3, 40),
      review(2, 3, 35),
      // this month: two reviews, ratings 5 and 5 -> average 5 live
      review(3, 5, 5),
      review(4, 5, 2),
    ];
    const stats = computeDashboardStats(reviews, [], PLACE_TZ_NOW);

    expect(stats.reviewCount).toBe(4);
    expect(stats.averageRating).toBe(4); // average of all 4 reviews to date (3,3,5,5)
    expect(stats.averageRatingTrend).toBeGreaterThan(0); // live avg (4) > prior-month avg (3)
    expect(stats.reviewCountTrend).toBe(2); // 4 now vs 2 as of last month
  });

  it("computes response rate from replies posted on-or-before the snapshot cutoff", () => {
    const reviews = [review(1, 4, 10), review(2, 2, 5)];
    const replies = [reply(1, 8)]; // only review 1 has been replied to
    const stats = computeDashboardStats(reviews, replies, PLACE_TZ_NOW);

    expect(stats.responseRate).toBe(50);
  });

  it("buckets sentiment by rating thresholds (>=4 positive, ==3 neutral, <=2 negative)", () => {
    const reviews = [review(1, 5, 1), review(2, 4, 1), review(3, 3, 1), review(4, 2, 1), review(5, 1, 1)];
    const stats = computeDashboardStats(reviews, [], PLACE_TZ_NOW);

    expect(stats.sentiment).toEqual({ positivePercent: 40, neutralPercent: 20, negativePercent: 40 });
  });

  it("flags an improving response rate as an insight when it rose since last month", () => {
    // Both reviews existed as of last month (50% replied then); this month
    // the previously-unreplied one got a reply, so the cumulative response
    // rate climbs from 50% -> 100%.
    const reviews = [review(1, 4, 40), review(2, 4, 38)];
    const replies = [reply(2, 36), reply(1, 5)];
    const stats = computeDashboardStats(reviews, replies, PLACE_TZ_NOW);

    expect(stats.insights.some((i) => i.includes("response rate improved"))).toBe(true);
  });

  it("flags a rating dip as an insight when live average is below last month's", () => {
    const reviews = [review(1, 5, 40), review(2, 5, 35), review(3, 1, 5)];
    const stats = computeDashboardStats(reviews, [], PLACE_TZ_NOW);

    expect(stats.insights.some((i) => i.includes("dipped"))).toBe(true);
  });

  it("falls back to the steady-state insight when nothing crosses a threshold", () => {
    // Same rating throughout (no dip), no replies either month (no response-rate
    // change), and this month's volume (1) is below an earlier month's (2), so
    // it isn't a "best month" either.
    const reviews = [review(1, 3, 70), review(2, 3, 65), review(3, 3, 5)];
    const stats = computeDashboardStats(reviews, [], PLACE_TZ_NOW);

    expect(stats.insights).toEqual(["No major shifts in your metrics this month — steady as she goes."]);
  });

  it("returns 12 calendar months of ratingTrend/reviewVolume, null-filled where no reviews landed", () => {
    const stats = computeDashboardStats([review(1, 5, 1)], [], PLACE_TZ_NOW);

    expect(stats.ratingTrend).toHaveLength(12);
    expect(stats.reviewVolume).toHaveLength(12);
    const currentMonth = stats.ratingTrend[stats.ratingTrend.length - 1];
    expect(currentMonth.averageRating).toBe(5);
    const emptyMonth = stats.ratingTrend[0];
    expect(emptyMonth.averageRating).toBeNull();
  });
});
