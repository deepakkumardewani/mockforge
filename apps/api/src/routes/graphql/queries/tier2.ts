import builder from "../builder";
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
    resolve: (_, args) => {
      return generateMessages({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  message: t.field({
    type: "Message",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const message = generateMessages({ limit: 1, skip: 0, order: "asc" })[0];
      return message!;
    },
  }),

  // Notifications
  notifications: t.field({
    type: ["Notification"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => {
      return generateNotifications({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  notification: t.field({
    type: "Notification",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const notification = generateNotifications({ limit: 1, skip: 0, order: "asc" })[0];
      return notification!;
    },
  }),

  // Quotes
  quotes: t.field({
    type: ["Quote"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => {
      return generateQuotes({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  quote: t.field({
    type: "Quote",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const quote = generateQuotes({ limit: 1, skip: 0, order: "asc" })[0];
      return quote!;
    },
  }),

  // Recipes
  recipes: t.field({
    type: ["Recipe"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => {
      return generateRecipes({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  recipe: t.field({
    type: "Recipe",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const recipe = generateRecipes({ limit: 1, skip: 0, order: "asc" })[0];
      return recipe!;
    },
  }),

  // Countries
  countries: t.field({
    type: ["Country"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => {
      return generateCountries({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  country: t.field({
    type: "Country",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const country = generateCountries({ limit: 1, skip: 0, order: "asc" })[0];
      return country!;
    },
  }),

  // Companies
  companies: t.field({
    type: ["Company"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => {
      return generateCompanies({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  company: t.field({
    type: "Company",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const company = generateCompanies({ limit: 1, skip: 0, order: "asc" })[0];
      return company!;
    },
  }),

  // Stocks
  stocks: t.field({
    type: ["Stock"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => {
      return generateStocks({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  stock: t.field({
    type: "Stock",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const stock = generateStocks({ limit: 1, skip: 0, order: "asc" })[0];
      return stock!;
    },
  }),

  // Events
  events: t.field({
    type: ["Event"],
    args: {
      limit: t.arg.int({ defaultValue: 10 }),
      skip: t.arg.int({ defaultValue: 0 }),
      search: t.arg.string(),
    },
    resolve: (_, args) => {
      return generateEvents({
        limit: Math.max(1, Math.min(100, args.limit ?? 10)),
        skip: Math.max(0, args.skip ?? 0),
        search: args.search ?? undefined,
        order: "asc",
      });
    },
  }),
  event: t.field({
    type: "Event",
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: () => {
      const event = generateEvents({ limit: 1, skip: 0, order: "asc" })[0];
      return event!;
    },
  }),
}));
