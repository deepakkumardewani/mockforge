import builder from "../builder";
import { mergeGeneratedRow } from "../../../lib/mock-merge";
import { generateUsers } from "../../../data/generators/users";
import { generateProducts } from "../../../data/generators/products";
import { generatePosts } from "../../../data/generators/posts";
import { generateComments } from "../../../data/generators/comments";
import { generateTodos } from "../../../data/generators/todos";
import { generateCarts } from "../../../data/generators/carts";

/** create* / update* / delete* for tier1 resources (posts/todos demos live in tier1.ts). */
builder.mutationFields((t) => ({
  createUser: t.field({
    type: "User",
    args: {
      firstName: t.arg.string(),
      lastName: t.arg.string(),
      email: t.arg.string(),
      username: t.arg.string(),
      phone: t.arg.string(),
      company: t.arg.string(),
      jobTitle: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateUsers, args),
  }),
  updateUser: t.field({
    type: "User",
    args: {
      id: t.arg.string({ required: true }),
      firstName: t.arg.string(),
      lastName: t.arg.string(),
      email: t.arg.string(),
      username: t.arg.string(),
      phone: t.arg.string(),
      company: t.arg.string(),
      jobTitle: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateUsers, args),
  }),
  deleteUser: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createProduct: t.field({
    type: "Product",
    args: {
      title: t.arg.string(),
      description: t.arg.string(),
      price: t.arg.float(),
      brand: t.arg.string(),
      category: t.arg.string(),
      stock: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateProducts, args),
  }),
  updateProduct: t.field({
    type: "Product",
    args: {
      id: t.arg.string({ required: true }),
      title: t.arg.string(),
      description: t.arg.string(),
      price: t.arg.float(),
      brand: t.arg.string(),
      category: t.arg.string(),
      stock: t.arg.int(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateProducts, args),
  }),
  deleteProduct: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  updatePost: t.field({
    type: "Post",
    args: {
      id: t.arg.string({ required: true }),
      title: t.arg.string(),
      body: t.arg.string(),
      userId: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generatePosts, args),
  }),
  deletePost: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createComment: t.field({
    type: "Comment",
    args: {
      body: t.arg.string(),
      author: t.arg.string(),
      email: t.arg.string(),
      postId: t.arg.string(),
      userId: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateComments, args),
  }),
  updateComment: t.field({
    type: "Comment",
    args: {
      id: t.arg.string({ required: true }),
      body: t.arg.string(),
      author: t.arg.string(),
      email: t.arg.string(),
      postId: t.arg.string(),
      userId: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateComments, args),
  }),
  deleteComment: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createTodo: t.field({
    type: "Todo",
    args: {
      todo: t.arg.string(),
      completed: t.arg.boolean(),
      userId: t.arg.string(),
      priority: t.arg.string(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateTodos, args),
  }),
  deleteTodo: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),

  createCart: t.field({
    type: "Cart",
    args: {
      userId: t.arg.string(),
      total: t.arg.float(),
      discountedTotal: t.arg.float(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateCarts, args),
  }),
  updateCart: t.field({
    type: "Cart",
    args: {
      id: t.arg.string({ required: true }),
      userId: t.arg.string(),
      total: t.arg.float(),
      discountedTotal: t.arg.float(),
    },
    resolve: (_root, args) => mergeGeneratedRow(generateCarts, args),
  }),
  deleteCart: t.field({
    type: "DeleteResult",
    args: { id: t.arg.string({ required: true }) },
    resolve: (_root, args) => ({ deleted: true, id: args.id }),
  }),
}));
