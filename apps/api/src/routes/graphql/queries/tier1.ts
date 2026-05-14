import builder from "../builder";
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
      resolve: (_, args) => {
        return generateUsers({
          limit: Math.max(1, Math.min(100, args.limit ?? 10)),
          skip: Math.max(0, args.skip ?? 0),
          search: args.search ?? undefined,
          order: "asc",
        });
      },
    }),
    user: t.field({
      type: "User",
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: () => {
        const user = generateUsers({ limit: 1, skip: 0, order: "asc" })[0];
        return user!;
      },
    }),

    // Products
    products: t.field({
      type: ["Product"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => {
        return generateProducts({
          limit: Math.max(1, Math.min(100, args.limit ?? 10)),
          skip: Math.max(0, args.skip ?? 0),
          search: args.search ?? undefined,
          order: "asc",
        });
      },
    }),
    product: t.field({
      type: "Product",
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: () => {
        const product = generateProducts({ limit: 1, skip: 0, order: "asc" })[0];
        return product!;
      },
    }),

    // Posts
    posts: t.field({
      type: ["Post"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => {
        return generatePosts({
          limit: Math.max(1, Math.min(100, args.limit ?? 10)),
          skip: Math.max(0, args.skip ?? 0),
          search: args.search ?? undefined,
          order: "asc",
        });
      },
    }),
    post: t.field({
      type: "Post",
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: () => {
        const post = generatePosts({ limit: 1, skip: 0, order: "asc" })[0];
        return post!;
      },
    }),

    // Comments
    comments: t.field({
      type: ["Comment"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => {
        return generateComments({
          limit: Math.max(1, Math.min(100, args.limit ?? 10)),
          skip: Math.max(0, args.skip ?? 0),
          search: args.search ?? undefined,
          order: "asc",
        });
      },
    }),
    comment: t.field({
      type: "Comment",
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: () => {
        const comment = generateComments({ limit: 1, skip: 0, order: "asc" })[0];
        return comment!;
      },
    }),

    // Todos
    todos: t.field({
      type: ["Todo"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => {
        return generateTodos({
          limit: Math.max(1, Math.min(100, args.limit ?? 10)),
          skip: Math.max(0, args.skip ?? 0),
          search: args.search ?? undefined,
          order: "asc",
        });
      },
    }),
    todo: t.field({
      type: "Todo",
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: () => {
        const todo = generateTodos({ limit: 1, skip: 0, order: "asc" })[0];
        return todo!;
      },
    }),

    // Carts
    carts: t.field({
      type: ["Cart"],
      args: {
        limit: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        search: t.arg.string(),
      },
      resolve: (_, args) => {
        return generateCarts({
          limit: Math.max(1, Math.min(100, args.limit ?? 10)),
          skip: Math.max(0, args.skip ?? 0),
          search: args.search ?? undefined,
          order: "asc",
        });
      },
    }),
    cart: t.field({
      type: "Cart",
      args: {
        id: t.arg.string({ required: true }),
      },
      resolve: () => {
        const cart = generateCarts({ limit: 1, skip: 0, order: "asc" })[0];
        return cart!;
      },
    }),
  }),
});
