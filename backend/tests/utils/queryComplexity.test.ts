import { parse } from "graphql";
import { getComplexity, simpleEstimator, directiveEstimator } from "graphql-query-complexity";
import { schema } from "../../src/graphql/schema";
import { queryComplexityLimit } from "../../src/config";

// Exercises the real, composed schema (every feature's typeDefs) rather than
// a hand-built stand-in, so a future @complexity annotation elsewhere in the
// schema (or its removal) is reflected here without needing a schema mock -
// same estimator chain queryComplexityPlugin.ts wires into Apollo Server.
function complexityOf(query: string, variables?: Record<string, unknown>) {
  return getComplexity({
    schema,
    query: parse(query),
    variables,
    estimators: [directiveEstimator(), simpleEstimator({ defaultComplexity: 1 })],
  });
}

describe("query complexity", () => {
  it("scores a typical Discover-shaped page well under the limit", () => {
    const complexity = complexityOf(`
      query {
        listPlaces(first: 12) {
          message
          data { id label averageRating reviewCount category { id label icon } openNow }
          pageInfo { hasNextPage endCursor }
        }
      }
    `);

    expect(complexity).toBeGreaterThan(0);
    expect(complexity).toBeLessThan(queryComplexityLimit);
  });

  it("rejects a max-page-size query stacking several live per-row fields", () => {
    const complexity = complexityOf(`
      query {
        listPlaces(first: 1000) {
          data {
            id
            owner { id email }
            category { id label }
            hours { id opensAt closesAt }
            photos { id url }
            ratingBreakdown { stars count }
            savedByMe
            savedListType
          }
        }
      }
    `);

    expect(complexity).toBeGreaterThan(queryComplexityLimit);
  });

  it("scales with the first argument even when passed as a variable", () => {
    const smallQuery = `query($first: Int) { listPlaces(first: $first) { data { id owner { id } } } }`;

    const small = complexityOf(smallQuery, { first: 10 });
    const large = complexityOf(smallQuery, { first: 1000 });

    expect(large).toBeGreaterThan(small * 50);
  });
});
