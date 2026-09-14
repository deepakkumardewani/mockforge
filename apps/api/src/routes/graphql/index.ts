import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { createYoga } from "graphql-yoga";
import builder from "./builder";
import { queryBudgetPlugin } from "./query-budget";
import { MAX_GRAPHQL_BODY_BYTES } from "../../lib/limits";

// Import type definitions to register them with builder
import "./types/tier1";
import "./types/tier2";
import "./types/delete-result";

// Import queries to register them with builder
import "./queries/tier1";
import "./queries/tier2";

import "./mutations/tier1";
import "./mutations/tier1-crud";
import "./mutations/tier2-crud";

const schema = builder.toSchema();

const yoga = createYoga({
  schema,
  graphiql: process.env.NODE_ENV !== "production",
  graphqlEndpoint: "/graphql",
  plugins: [queryBudgetPlugin()],
});

const graphqlRouter = new Hono();

graphqlRouter.use(
  "*",
  bodyLimit({
    maxSize: MAX_GRAPHQL_BODY_BYTES,
    onError: (c) =>
      c.json(
        {
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "GraphQL body exceeds the maximum allowed size",
          },
        },
        413,
      ),
  }),
);

graphqlRouter.all("*", (c) => yoga.fetch(c.req.raw));

export default graphqlRouter;
