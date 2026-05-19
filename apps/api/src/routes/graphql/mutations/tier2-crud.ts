import builder from "../builder";
import { mergeGeneratedRow } from "../../../lib/mock-merge";
import { generateMessages } from "../../../data/generators/messages";
import { generateNotifications } from "../../../data/generators/notifications";
import { generateQuotes } from "../../../data/generators/quotes";
import { generateRecipes } from "../../../data/generators/recipes";
import { generateCountries } from "../../../data/generators/countries";
import { generateCompanies } from "../../../data/generators/companies";
import { generateStocks } from "../../../data/generators/stocks";
import { generateEvents } from "../../../data/generators/events";

/** create* / update* / delete* for tier2 resources. Nested objects shallow-merge like REST. */
builder.mutationFields((t) => ({
  createMessage: t.field({
    type: "Message",
    args: {
      senderId: t.arg.string(),
      receiverId: t.arg.string(),
      roomId: t.arg.string(),
      body: t.arg.string(),
      read: t.arg.boolean(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateMessages, args),
  }),
  updateMessage: t.field({
    type: "Message",
    args: {
      id: t.arg.string({ required: true }),
      senderId: t.arg.string(),
      receiverId: t.arg.string(),
      roomId: t.arg.string(),
      body: t.arg.string(),
      read: t.arg.boolean(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateMessages, args),
  }),
  deleteMessage: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createNotification: t.field({
    type: "Notification",
    args: {
      userId: t.arg.string(),
      type: t.arg.string(),
      title: t.arg.string(),
      message: t.arg.string(),
      read: t.arg.boolean(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateNotifications, args),
  }),
  updateNotification: t.field({
    type: "Notification",
    args: {
      id: t.arg.string({ required: true }),
      userId: t.arg.string(),
      type: t.arg.string(),
      title: t.arg.string(),
      message: t.arg.string(),
      read: t.arg.boolean(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateNotifications, args),
  }),
  deleteNotification: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createQuote: t.field({
    type: "Quote",
    args: {
      content: t.arg.string(),
      author: t.arg.string(),
      category: t.arg.string(),
      likes: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateQuotes, args),
  }),
  updateQuote: t.field({
    type: "Quote",
    args: {
      id: t.arg.string({ required: true }),
      content: t.arg.string(),
      author: t.arg.string(),
      category: t.arg.string(),
      likes: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateQuotes, args),
  }),
  deleteQuote: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createRecipe: t.field({
    type: "Recipe",
    args: {
      name: t.arg.string(),
      description: t.arg.string(),
      cuisine: t.arg.string(),
      difficulty: t.arg.string(),
      prepTimeMinutes: t.arg.int(),
      cookTimeMinutes: t.arg.int(),
      servings: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateRecipes, args),
  }),
  updateRecipe: t.field({
    type: "Recipe",
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string(),
      description: t.arg.string(),
      cuisine: t.arg.string(),
      difficulty: t.arg.string(),
      prepTimeMinutes: t.arg.int(),
      cookTimeMinutes: t.arg.int(),
      servings: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateRecipes, args),
  }),
  deleteRecipe: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createCountry: t.field({
    type: "Country",
    args: {
      name: t.arg.string(),
      code: t.arg.string(),
      capital: t.arg.string(),
      region: t.arg.string(),
      population: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateCountries, args),
  }),
  updateCountry: t.field({
    type: "Country",
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string(),
      code: t.arg.string(),
      capital: t.arg.string(),
      region: t.arg.string(),
      population: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateCountries, args),
  }),
  deleteCountry: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createCompany: t.field({
    type: "Company",
    args: {
      name: t.arg.string(),
      industry: t.arg.string(),
      description: t.arg.string(),
      website: t.arg.string(),
      email: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateCompanies, args),
  }),
  updateCompany: t.field({
    type: "Company",
    args: {
      id: t.arg.string({ required: true }),
      name: t.arg.string(),
      industry: t.arg.string(),
      description: t.arg.string(),
      website: t.arg.string(),
      email: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateCompanies, args),
  }),
  deleteCompany: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createStock: t.field({
    type: "Stock",
    args: {
      symbol: t.arg.string(),
      name: t.arg.string(),
      price: t.arg.float(),
      change: t.arg.float(),
      exchange: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateStocks, args),
  }),
  updateStock: t.field({
    type: "Stock",
    args: {
      id: t.arg.string({ required: true }),
      symbol: t.arg.string(),
      name: t.arg.string(),
      price: t.arg.float(),
      change: t.arg.float(),
      exchange: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateStocks, args),
  }),
  deleteStock: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createEvent: t.field({
    type: "Event",
    args: {
      title: t.arg.string(),
      description: t.arg.string(),
      category: t.arg.string(),
      location: t.arg.string(),
      isFree: t.arg.boolean(),
      price: t.arg.float(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateEvents, args),
  }),
  updateEvent: t.field({
    type: "Event",
    args: {
      id: t.arg.string({ required: true }),
      title: t.arg.string(),
      description: t.arg.string(),
      category: t.arg.string(),
      location: t.arg.string(),
      isFree: t.arg.boolean(),
      price: t.arg.float(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateEvents, args),
  }),
  deleteEvent: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),
}));
