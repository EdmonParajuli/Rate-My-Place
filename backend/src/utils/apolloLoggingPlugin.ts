import type { ApolloServerPlugin } from "@apollo/server";
import { logger } from "./logger";

// Logs every GraphQL operation - start (debug), completion (info, with
// duration), and any errors (error, with the GraphQLError's code/status) -
// tagged with the per-request id pino-http attaches (see server.ts). This is
// the "resolver layer" of doc 6's "structured logging ... threaded through
// resolver -> service -> repository": one plugin covers every resolver's
// entry/exit uniformly instead of repeating log calls across all 14 resolver
// files.
export const loggingPlugin: ApolloServerPlugin = {
  async requestDidStart({ request, contextValue }) {
    const start = Date.now();
    const log = (contextValue as { logger?: typeof logger })?.logger ?? logger;
    const operationName = request.operationName ?? "anonymous";

    log.debug({ operationName }, "graphql operation started");

    return {
      async didEncounterErrors({ errors }) {
        for (const error of errors) {
          const extensions = error.extensions as { code?: string; status?: number } | undefined;
          log.error(
            { operationName, code: extensions?.code, status: extensions?.status, err: error },
            "graphql operation errored"
          );
        }
      },
      async willSendResponse() {
        log.info({ operationName, durationMs: Date.now() - start }, "graphql operation completed");
      },
    };
  },
};
