import type { Quote } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/quotes.json";

const seed = seedData as Quote[];

export function generateQuotes(params: PaginationParams): Quote[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (qt) =>
        qt.content.toLowerCase().includes(q) ||
        qt.author.toLowerCase().includes(q) ||
        qt.category.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
