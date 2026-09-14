import builder from "../builder";
import { clampGraphQLListArgs } from "../../../lib/pagination";
import { findSeededById } from "../../../lib/seeded-lookup";
import { generateUsers } from "../../../data/generators/users";
import { generateProducts } from "../../../data/generators/products";
import { generatePosts } from "../../../data/generators/posts";
import { generateComments } from "../../../data/generators/comments";
import { generateTodos } from "../../../data/generators/todos";
import { generateCarts } from "../../../data/generators/carts";

// Query builder
builder.queryType({
  fields: (t) => ({
    // Users
    users: t.field({
      type: ["User"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => generateUsers(clampGraphQLListArgs(args)),
    }),
    user: t.field({
      type: "User",
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: (_, args) => findSeededById(generateUsers, args.id),
    }),

    // Products
    products: t.field({
      type: ["Product"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => generateProducts(clampGraphQLListArgs(args)),
    }),
    product: t.field({
      type: "Product",
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: (_, args) => findSeededById(generateProducts, args.id),
    }),

    // Posts
    posts: t.field({
      type: ["Post"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => generatePosts(clampGraphQLListArgs(args)),
    }),
    post: t.field({
      type: "Post",
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: (_, args) => findSeededById(generatePosts, args.id),
    }),

    // Comments
    comments: t.field({
      type: ["Comment"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => generateComments(clampGraphQLListArgs(args)),
    }),
    comment: t.field({
      type: "Comment",
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: (_, args) => findSeededById(generateComments, args.id),
    }),

    // Todos
    todos: t.field({
      type: ["Todo"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => generateTodos(clampGraphQLListArgs(args)),
    }),
    todo: t.field({
      type: "Todo",
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: (_, args) => findSeededById(generateTodos, args.id),
    }),

    // Carts
    carts: t.field({
      type: ["Cart"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => generateCarts(clampGraphQLListArgs(args)),
    }),
    cart: t.field({
      type: "Cart",
      nullable: true,
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: (_, args) => findSeededById(generateCarts, args.id),
    }),
  }),
});
