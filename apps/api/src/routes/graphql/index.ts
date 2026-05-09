import { Hono } from 'hono'
import { createYoga } from 'graphql-yoga'
import builder from './builder'

// Import type definitions to register them with builder
import './types/tier1'
import './types/tier2'

// Import queries to register them with builder
import './queries/tier1'
import './queries/tier2'

// Build the schema
const schema = builder.toSchema()

// Create the yoga instance with the schema
const yoga = createYoga({
  schema,
  graphiql: true,
  graphqlEndpoint: '/graphql',
})

// Create a Hono router for GraphQL
const graphqlRouter = new Hono()

// Mount the GraphQL yoga handler — pass the raw request directly
graphqlRouter.all('*', (c) => yoga.fetch(c.req.raw))

export default graphqlRouter
