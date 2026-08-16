import cron from "node-cron";
import PlaceService from "../services/placeService";
import { logger } from "../utils/logger";

// The first scheduled/background job in this codebase - everything else so
// far is request-driven. Design decided in docs/08-trending-strategy.md:
// a materialized trending_score (plain indexed column, sorted exactly like
// HIGHEST_RATED/NEW) refreshed periodically, rather than computed live per
// request - resolves both query cost and a real correctness issue (a
// continuously-changing live score breaks stable cursor pagination, since
// the ranking could shift between a caller's page 1 and page 2 requests).
//
// Goes through PlaceService, not PlaceRepository directly - a job is a
// caller like a resolver or another service, so it keeps the same
// resolver/job -> service -> repository layering as everything else; the
// actual raw 24h-count SQL lives in PlaceRepository.refreshTrendingScores,
// the only place in this module that touches Sequelize.
const refreshTrendingScores = async (): Promise<void> => {
    await new PlaceService().refreshTrendingScores();
};

// Runs once immediately (so trending_score isn't all-zero for up to an hour
// after a fresh deploy/migration) and then hourly on the hour. In-process
// scheduling (node-cron), no separate worker - sufficient at this app's
// scale, consistent with the single-process nodemon/Railway-or-Render
// deployment story in docs/06-quality-and-ops.md.
export const startTrendingScoreJob = (): void => {
    refreshTrendingScores().catch((error) => {
        logger.error({ err: error }, "Initial trending score refresh failed");
    });

    cron.schedule("0 * * * *", () => {
        refreshTrendingScores().catch((error) => {
            logger.error({ err: error }, "Scheduled trending score refresh failed");
        });
    });
};
