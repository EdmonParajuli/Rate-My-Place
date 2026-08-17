import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import express from "express";
import http, { IncomingMessage } from "http";
import crypto from "crypto";
import cors from "cors";
import pinoHttp from "pino-http";
import { Database } from "./config";
import { schema } from "./graphql/schema";
import { verifyJwt } from "./utils/jwt";
import { startTrendingScoreJob } from "./jobs/trendingScoreJob";
import { rateLimiter } from "./middlewares";
import { logger } from "./utils/logger";
import { loggingPlugin } from "./utils/apolloLoggingPlugin";
import { queryComplexityPlugin } from "./utils/queryComplexityPlugin";

dotenv.config();

// One access-log line per request (method/url/status/duration), tagged with
// a request id - respects an incoming x-request-id (useful behind a
// reverse proxy that already generates one) and always echoes it back on the
// response so a client/proxy can correlate. Mounted globally (this app has
// no routes besides /graphql) so it wraps rateLimiter/cors/json too.
const httpLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existing = req.headers["x-request-id"];
    const id = (Array.isArray(existing) ? existing[0] : existing) || crypto.randomUUID();
    res.setHeader("x-request-id", id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // GraphQL requests carry auth tokens in headers and arbitrary user input in
  // the body - don't let pino-http's default serializers echo either.
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});

class Server {
  private app: express.Application;

  constructor() {
    this.app = express();
    // Required for rateLimiter to key on the real client IP rather than the
    // reverse proxy's - both recommended hosts (Railway/Render, per
    // docs/06-quality-and-ops.md) sit in front of the app, so without this
    // req.ip resolves to the proxy for every client, collapsing everyone
    // into one shared rate-limit bucket.
    this.app.set("trust proxy", 1);
    this.app.use(httpLogger);
  }

  public async start() {
    await this.connectDB();
    startTrendingScoreJob();

    const httpServer = http.createServer(this.app);

    const apolloServer = new ApolloServer({
      schema,
      introspection: true,
      plugins: [loggingPlugin, queryComplexityPlugin],
    });

    await apolloServer.start();

    this.app.use(
      "/graphql",
      cors(),
      express.json(),
      rateLimiter,
      expressMiddleware(apolloServer, {
        context: async ({
          req,
        }: {
          req: IncomingMessage | any;
        }): Promise<any> => {
          const operationName = req.body.operationName;
          const authorization = req.headers?.authorization as string;

          let user: any = null;

          if (authorization?.startsWith("Bearer ")) {
            const token = authorization.split(" ")[1];

            try {
                user = verifyJwt(token); // your JWT verification function
              } catch (err) {
                user = null;
              }
            }

          return {
            authorization,
            operationName,
            user,
            headers: req.headers,
            ip: req.ip || req.socket?.remoteAddress,
            logger: req.log,
            requestId: req.id,
          };
        },
      })
    );

    await new Promise<void>(async (resolve) => {
      const PORT = Number(process.env.PORT) || 4000;

      httpServer.listen(PORT, () => {
        logger.info(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      });
    });
  }

  private async connectDB() {
    try {
      await Promise.all([Database.connection()]);
    } catch (error: any) {
      logger.error({ err: error }, "Database connection failed");
      throw new Error(error);
    }
  }
}

const server = new Server();
server.start();
