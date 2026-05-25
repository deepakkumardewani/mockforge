import type { Post } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/posts.json";

const seed = seedData as Post[];

export function generatePosts(params: PaginationParams): Post[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
