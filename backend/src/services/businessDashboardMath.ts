// Pure aggregation functions for the Business Dashboard - no I/O, no
// Sequelize, so the reputation-score formula and trend logic can be read
// (and eyeballed against real numbers) as one file, independent of how the
// review/reply rows were fetched. See docs/specs/phase-6-business-dashboard.md
// for the formula rationale.

export interface DashboardReviewRow {
  id: number;
  rating: number;
  createdAt: Date;
}

export interface DashboardReplyRow {
  reviewId: number;
  createdAt: Date;
}

export interface MonthlyRatingPoint {
  month: string; // "YYYY-MM"
  averageRating: number | null; // null when the place had zero reviews that month
}

export interface MonthlyVolumePoint {
  month: string; // "YYYY-MM"
  reviewCount: number;
}

export interface SentimentBreakdown {
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
}

export interface BusinessDashboardComputed {
  reputationScore: number;
  reputationScoreTrend: number;
  averageRating: number;
  averageRatingTrend: number;
  reviewCount: number;
  reviewCountTrend: number;
  responseRate: number;
  responseRateTrend: number;
  ratingTrend: MonthlyRatingPoint[];
  reviewVolume: MonthlyVolumePoint[];
  sentiment: SentimentBreakdown;
  insights: string[];
}

const MONTHS_BACK = 12;
const RECENCY_WINDOW_DAYS = 90;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// A single review/reply "state of the world" as of a point in time - used
// both for the live numbers and, fed an earlier cutoff, for last month's
// numbers. One function, two calls, rather than separate monthly-cohort
// bookkeeping - see the spec's "Trend deltas" section.
function snapshotAsOf(reviews: DashboardReviewRow[], replies: DashboardReplyRow[], asOf: Date) {
  const reviewsSoFar = reviews.filter((r) => r.createdAt <= asOf);
  const repliedReviewIds = new Set(
    replies.filter((r) => r.createdAt <= asOf).map((r) => r.reviewId)
  );
  const repliedCount = reviewsSoFar.filter((r) => repliedReviewIds.has(r.id)).length;
  const reviewCount = reviewsSoFar.length;
  const averageRating = average(reviewsSoFar.map((r) => r.rating));
  const responseRate = reviewCount === 0 ? 0 : (repliedCount / reviewCount) * 100;
  const recentCount = reviewsSoFar.filter((r) => daysBetween(r.createdAt, asOf) <= RECENCY_WINDOW_DAYS).length;
  const reputationScore = computeReputationScore({ averageRating, reviewCount, responseRate, recentCount });

  return { reviewCount, averageRating, responseRate, reputationScore };
}

// Weighted composite, 0-100: rating (55%) + review-volume confidence (20%,
// diminishing returns via log scale) + response rate (15%) + recency/
// activity (10%). Weights and rationale documented in
// docs/specs/phase-6-business-dashboard.md.
export function computeReputationScore({
  averageRating,
  reviewCount,
  responseRate,
  recentCount,
}: {
  averageRating: number;
  reviewCount: number;
  responseRate: number;
  recentCount: number;
}): number {
  const ratingScore = (averageRating / 5) * 100;
  const volumeScore = 100 * Math.min(1, Math.log(reviewCount + 1) / Math.log(101));
  const responseScore = responseRate;
  const recencyScore = 100 * Math.min(1, recentCount / 5);

  const raw = 0.55 * ratingScore + 0.2 * volumeScore + 0.15 * responseScore + 0.1 * recencyScore;
  return Math.round(raw);
}

// Last N calendar months up to and including `now`'s month, zero/null-filled
// so callers (the dashboard's charts) never have to handle gaps - same
// precedent as ReviewRepository.getRatingBreakdown filling in unrepresented
// star values.
function computeMonthlyBuckets(
  reviews: DashboardReviewRow[],
  now: Date,
  monthsBack: number
): { ratingTrend: MonthlyRatingPoint[]; reviewVolume: MonthlyVolumePoint[] } {
  const buckets = new Map<string, number[]>();
  const months: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    months.push(key);
    buckets.set(key, []);
  }

  for (const review of reviews) {
    const key = monthKey(review.createdAt);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(review.rating);
    }
  }

  const ratingTrend = months.map((month) => {
    const ratings = buckets.get(month)!;
    return { month, averageRating: ratings.length === 0 ? null : round(average(ratings), 2) };
  });
  const reviewVolume = months.map((month) => ({ month, reviewCount: buckets.get(month)!.length }));

  return { ratingTrend, reviewVolume };
}

function computeSentiment(reviews: DashboardReviewRow[]): SentimentBreakdown {
  const total = reviews.length;
  if (total === 0) {
    return { positivePercent: 0, neutralPercent: 0, negativePercent: 0 };
  }

  const positive = reviews.filter((r) => r.rating >= 4).length;
  const neutral = reviews.filter((r) => r.rating === 3).length;
  const negative = reviews.filter((r) => r.rating <= 2).length;

  return {
    positivePercent: round((positive / total) * 100, 0),
    neutralPercent: round((neutral / total) * 100, 0),
    negativePercent: round((negative / total) * 100, 0),
  };
}

// Rule-based, not text-mined - see spec's "Insights" section for why (no NLP
// dependency exists in this project). Fixed priority order, up to 3 shown.
function computeInsights({
  live,
  prior,
  reviewVolume,
}: {
  live: ReturnType<typeof snapshotAsOf>;
  prior: ReturnType<typeof snapshotAsOf>;
  reviewVolume: MonthlyVolumePoint[];
}): string[] {
  if (live.reviewCount === 0) {
    return ["You haven't received any reviews yet — once customers start reviewing, insights will appear here."];
  }

  const insights: string[] = [];

  if (live.responseRate > prior.responseRate) {
    insights.push(
      `Your response rate improved ${round(live.responseRate - prior.responseRate, 0)}% this month — keep it up to boost your Reputation Score.`
    );
  }

  const currentMonth = reviewVolume[reviewVolume.length - 1];
  const isBestMonth =
    currentMonth.reviewCount > 0 && reviewVolume.every((m) => m.reviewCount <= currentMonth.reviewCount);
  if (isBestMonth) {
    const label = new Date(`${currentMonth.month}-01T00:00:00`).toLocaleString('en-US', { month: 'long' });
    insights.push(`You hit ${currentMonth.reviewCount} reviews in ${label} — your best month yet. Share it with your customers!`);
  }

  if (prior.reviewCount > 0 && live.averageRating < prior.averageRating) {
    insights.push('Your average rating dipped this month — worth a look at your most recent reviews.');
  }

  if (insights.length === 0) {
    insights.push('No major shifts in your metrics this month — steady as she goes.');
  }

  return insights.slice(0, 3);
}

export function computeDashboardStats(
  reviews: DashboardReviewRow[],
  replies: DashboardReplyRow[],
  now: Date
): BusinessDashboardComputed {
  const live = snapshotAsOf(reviews, replies, now);
  const asOfLastMonth = new Date(startOfMonth(now).getTime() - 1);
  const prior = snapshotAsOf(reviews, replies, asOfLastMonth);

  const { ratingTrend, reviewVolume } = computeMonthlyBuckets(reviews, now, MONTHS_BACK);
  const sentiment = computeSentiment(reviews);
  const insights = computeInsights({ live, prior, reviewVolume });

  return {
    reputationScore: live.reputationScore,
    reputationScoreTrend: live.reputationScore - prior.reputationScore,
    averageRating: round(live.averageRating, 1),
    averageRatingTrend: round(live.averageRating - prior.averageRating, 1),
    reviewCount: live.reviewCount,
    reviewCountTrend: live.reviewCount - prior.reviewCount,
    responseRate: round(live.responseRate, 0),
    responseRateTrend: round(live.responseRate - prior.responseRate, 0),
    ratingTrend,
    reviewVolume,
    sentiment,
    insights,
  };
}
