import builder from "../builder";
import { generatePosts } from "../../../data/generators/posts";
import { generateTodos } from "../../../data/generators/todos";

/**
 * Demo mutations — same spirit as REST: deterministic generated entities merged with
 * caller input; nothing is persisted (playground / seeded API).
 */
builder.mutationType({
  fields: (t) => ({
    createPost: t.field({
      type: "Post",
      args: {
        title: t.arg.string({ required: true }),
        body: t.arg.string(),
        userId: t.arg.int(),
      },
      resolve: (_root, args) => {
        const base = generatePosts({ limit: 1, skip: 0, order: "asc" })[0]!;
        return {
          ...base,
          title: args.title,
          ...(args.body !== null && args.body !== undefined ? { body: args.body } : {}),
          ...(args.userId !== null && args.userId !== undefined ? { userId: args.userId } : {}),
        };
      },
    }),

    updateTodo: t.field({
      type: "Todo",
      args: {
        id: t.arg.int({ required: true }),
        todo: t.arg.string(),
        completed: t.arg.boolean(),
      },
      resolve: (_root, args) => {
        const base = generateTodos({ limit: 1, skip: 0, order: "asc" })[0]!;
        return {
          ...base,
          id: args.id,
          ...(args.todo !== null && args.todo !== undefined ? { todo: args.todo } : {}),
          ...(args.completed !== null && args.completed !== undefined
            ? { completed: args.completed }
            : {}),
        };
      },
    }),
  }),
});
