import type { ApolloServerPlugin } from "@apollo/server";
import { getComplexity, simpleEstimator, directiveEstimator } from "graphql-query-complexity";
import { queryComplexityLimit } from "../config";
import { throwError } from "../helpers/errorHelper";
import { logger } from "./logger";

// doc 6's query-cost/depth-limiting item: listPlaces/placeReviews/myReviews
// already clamp `first` server-side (CursorBasedPagination's MaxLimit), but
// nothing stopped a client from combining a large `first` with several of
// Place/Review's live per-row resolvers (owner, category, hours, photos,
// reviewer, place, reply, ...) - each selected field is a separate DB call
// per row, so a single request can still force thousands of round trips.
// directiveEstimator reads the @complexity directive (commonTypedefs.ts)
// that the affected fields are annotated with; simpleEstimator is the
// fallback for every other (cheap, non-DB) field.
export const queryComplexityPlugin: ApolloServerPlugin = {
  async requestDidStart({ request, contextValue }) {
    return {
      async didResolveOperation({ schema, document, operationName }) {
        const log = (contextValue as { logger?: typeof logger })?.logger ?? logger;

        const complexity = getComplexity({
          schema,
          query: document,
          variables: request.variables,
          operationName: operationName ?? undefined,
          estimators: [directiveEstimator(), simpleEstimator({ defaultComplexity: 1 })],
        });

        if (complexity > queryComplexityLimit) {
          log.warn({ operationName, complexity, limit: queryComplexityLimit }, "graphql query rejected: too complex");
          throwError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${queryComplexityLimit}.`,
            "QUERY_TOO_COMPLEX",
            400
          );
        }
      },
    };
  },
};
