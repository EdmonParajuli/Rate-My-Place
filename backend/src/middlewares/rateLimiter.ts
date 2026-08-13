import rateLimit from "express-rate-limit";

// Blanket limiter on /graphql, per docs/06-quality-and-ops.md's "express-rate-limit
// on /graphql at minimum" recommendation - this bounds request *volume*, not
// per-query cost/depth (a separate concern; listPlaces' filters aren't expensive
// enough yet to need query-complexity analysis on top of this). Applies to every
// operation through the single /graphql endpoint, not scoped to listPlaces
// specifically - that's the documented starting point, not a permanent choice.
//
// Plain, easily-retuned constants, not central config - this isn't required
// config the app should fail fast without (unlike src/config/index.ts's
// mustExist-guarded vars), just a tunable operational default.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 300;

export const rateLimiter = rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_REQUESTS_PER_WINDOW,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // Matches this app's GraphQLError envelope shape (extensions: {code, status})
    // instead of express-rate-limit's default plain-text body, so a rate-limited
    // response doesn't need special-case handling on the client.
    handler: (req, res) => {
        res.status(429).json({
            errors: [
                {
                    message: "Too many requests. Please try again later.",
                    extensions: { code: "RATE_LIMITED", status: 429 },
                },
            ],
        });
    },
});
