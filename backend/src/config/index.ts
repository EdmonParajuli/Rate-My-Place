import sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Deliberately console.error, not the pino logger (see src/utils/logger.ts):
// this runs at module-load time, before a request/logger context exists, and
// dev's pino-pretty transport writes via a worker thread - not guaranteed to
// flush before the immediately-following process.exit(1). console.error to
// stderr is synchronous and always flushes first.
const mustExist = <T>(value: T | undefined, name: string): T => {
    if (!value) {
      console.error(`Missing Config: ${name} !!!`);
      process.exit(1);
    }
    return value;
  };

export const port = mustExist(+process.env.PORT!, "PORT") as number,
  cloudinary = {
    cloudName: mustExist(process.env.CLOUDINARY_NAME!, "CLOUDINARY_NAME"),
    apiKey: mustExist(process.env.API_KEY!, "API_KEY"),
    apiSecret: mustExist(process.env.API_SECRET!, "API_SECRET"),
  },
  db = {
    username: mustExist(process.env.DB_USER!, "DB_USER"),
    password: mustExist(process.env.DB_PASSWORD!, "DB_PASSWORD"),
    name: mustExist(process.env.DB_NAME!, "DB_NAME"),
    host: mustExist(process.env.DB_HOST!, "DB_HOST"),
    dialect: mustExist(process.env.DB_DIALECT!, "DB_DIALECT"),
    port: mustExist(+process.env.DB_PORT!, "DB_PORT"),
    logging: false,
    timezone: "utc",
  } as {
    username: string;
    password: string;
    name: string;
    host: string;
    dialect: sequelize.Dialect;
    port: number;
    logging: boolean;
    timezone: string;
  };

// Optional, not fail-fast like the config above - a sane default keeps every
// existing .env working without changes. See src/utils/queryComplexityPlugin.ts:
// a typical Discover page (listPlaces(first: 12) with a handful of nested
// live fields like category/openNow/savedByMe) scores in the low hundreds;
// the same shape at the pagination layer's max page size (first: 1000, see
// CursorBasedPagination's MaxLimit) scores in the tens of thousands - 2000
// comfortably allows legitimate page sizes well past what any current screen
// requests while rejecting that kind of near-max-page-size abuse.
export const queryComplexityLimit = Number(process.env.QUERY_COMPLEXITY_LIMIT) || 2000;

export * from './instance';