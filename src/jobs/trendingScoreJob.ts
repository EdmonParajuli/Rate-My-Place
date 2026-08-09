import cron from "node-cron";
import { Database } from "../config";

// The first scheduled/background job in this codebase - everything else so
// far is request-driven. Design decided in docs/08-trending-strategy.md:
// a materialized trending_score (plain indexed column, sorted exactly like
// HIGHEST_RATED/NEW) refreshed periodically, rather than computed live per
// request - resolves both query cost and a real correctness issue (a
// continuously-changing live score breaks stable cursor pagination, since
// the ranking could shift between a caller's page 1 and page 2 requests).
//
// Raw count over a fixed 24h window, not decayed - once the score is
// periodically materialized rather than live-computed, a plain count is
// simpler and just as valid; the "smoothness" a decay function buys mostly
// matters for a score that changes every request, not one that changes once
// an hour. The window is a plain constant, trivial to widen (e.g. to 7 days)
// later if 24h turns out to have too little signal.
export const refreshTrendingScores = async (): Promise<void> => {
    await Database.sequelize.query(`
        UPDATE providers_places
        SET trending_score = COALESCE(sub.recent_count, 0)
        FROM (
            SELECT place_id, COUNT(*) AS recent_count
            FROM providers_reviews
            WHERE deleted_at IS NULL
              AND created_at > NOW() - INTERVAL '24 hours'
            GROUP BY place_id
        ) sub
        WHERE providers_places.id = sub.place_id;
    `);

    await Database.sequelize.query(`
        UPDATE providers_places
        SET trending_score = 0
        WHERE trending_score != 0
          AND id NOT IN (
              SELECT place_id FROM providers_reviews
              WHERE deleted_at IS NULL AND created_at > NOW() - INTERVAL '24 hours'
          );
    `);
};

// Runs once immediately (so trending_score isn't all-zero for up to an hour
// after a fresh deploy/migration) and then hourly on the hour. In-process
// scheduling (node-cron), no separate worker - sufficient at this app's
// scale, consistent with the single-process nodemon/Railway-or-Render
// deployment story in docs/06-quality-and-ops.md.
export const startTrendingScoreJob = (): void => {
    refreshTrendingScores().catch((error) => {
        console.error("Initial trending score refresh failed:", error.message);
    });

    cron.schedule("0 * * * *", () => {
        refreshTrendingScores().catch((error) => {
            console.error("Scheduled trending score refresh failed:", error.message);
        });
    });
};
