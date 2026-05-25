import type { Comment } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/comments.json";

const seed = seedData as Comment[];

export function generateComments(params: PaginationParams): Comment[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (c) =>
        c.body.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
