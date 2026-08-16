import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

// Base, process-wide logger - boot/background code (DB connect, the trending
// score cron job) logs through this directly. Per-request code should prefer
// context.logger (see server.ts's pino-http middleware) so log lines carry a
// request id; this is the fallback for call sites with no request in scope.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  serializers: { err: pino.stdSerializers.err },
  // Pretty-printed in dev for readability; raw JSON in production, the shape
  // log aggregators (per docs/06-quality-and-ops.md's Sentry/APM note) expect.
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:HH:MM:ss", ignore: "pid,hostname" },
      },
});
