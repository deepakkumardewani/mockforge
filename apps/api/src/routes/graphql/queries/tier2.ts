import builder from "../builder";
import { clampGraphQLListArgs } from "../../../lib/pagination";
import { findSeededById } from "../../../lib/seeded-lookup";
import { generateMessages } from "../../../data/generators/messages";
import { generateNotifications } from "../../../data/generators/notifications";
import { generateQuotes } from "../../../data/generators/quotes";
import { generateRecipes } from "../../../data/generators/recipes";
import { generateCountries } from "../../../data/generators/countries";
import { generateCompanies } from "../../../data/generators/companies";
import { generateStocks } from "../../../data/generators/stocks";
import { generateEvents } from "../../../data/generators/events";

// Extend the query type with Tier 2 fields
builder.queryFields((t) => ({
  // Messages
  messages: t.field({
    type: ["Message"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateMessages(clampGraphQLListArgs(args)),
  }),
  message: t.field({
    type: "Message",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateMessages, args.id),
  }),

  // Notifications
  notifications: t.field({
    type: ["Notification"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateNotifications(clampGraphQLListArgs(args)),
  }),
  notification: t.field({
    type: "Notification",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateNotifications, args.id),
  }),

  // Quotes
  quotes: t.field({
    type: ["Quote"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateQuotes(clampGraphQLListArgs(args)),
  }),
  quote: t.field({
    type: "Quote",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateQuotes, args.id),
  }),

  // Recipes
  recipes: t.field({
    type: ["Recipe"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateRecipes(clampGraphQLListArgs(args)),
  }),
  recipe: t.field({
    type: "Recipe",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateRecipes, args.id),
  }),

  // Countries
  countries: t.field({
    type: ["Country"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateCountries(clampGraphQLListArgs(args)),
  }),
  country: t.field({
    type: "Country",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateCountries, args.id),
  }),

  // Companies
  companies: t.field({
    type: ["Company"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateCompanies(clampGraphQLListArgs(args)),
  }),
  company: t.field({
    type: "Company",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateCompanies, args.id),
  }),

  // Stocks
  stocks: t.field({
    type: ["Stock"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateStocks(clampGraphQLListArgs(args)),
  }),
  stock: t.field({
    type: "Stock",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateStocks, args.id),
  }),

  // Events
  events: t.field({
    type: ["Event"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => generateEvents(clampGraphQLListArgs(args)),
  }),
  event: t.field({
    type: "Event",
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (_, args) => findSeededById(generateEvents, args.id),
  }),
}));
