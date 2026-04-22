import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import dotenv from "dotenv";
import express from "express";
import http, { IncomingMessage } from "http";
import cors from "cors";
import { Database } from "./config";
import { schema } from "./graphql/schema";

dotenv.config();

class Server {
  private app: express.Application;

  constructor() {
    this.app = express();
  }

  public async start() {
    await this.connectDB();

    const httpServer = http.createServer(this.app);

    const apolloServer = new ApolloServer({
      schema,
      introspection: true,
    });

    await apolloServer.start();

    this.app.use(
      "/graphql",
      cors(),
      express.json(),
      expressMiddleware(apolloServer, {
        context: async ({
          req,
        }: {
          req: IncomingMessage | any;
        }): Promise<any> => {
            const operationName = req.body.operationName;
          const authorization = req.headers?.authorization as string;

          return {
            authorization,
            operationName
          };
        },
      })
    );

    await new Promise<void>(async (resolve) => {
      const PORT = Number(process.env.PORT) || 4000;

      httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      });
    });
  }

  private async connectDB() {
    try {
      await Promise.all([Database.connection()]);
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error);
    }
  }
}

const server = new Server();
server.start();
