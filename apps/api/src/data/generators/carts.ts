import type { Cart } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/carts.json";

const seed = seedData as Cart[];

export function generateCarts(params: PaginationParams): Cart[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter((c) => c.products.some((p) => p.title.toLowerCase().includes(q)));
  }

  return items.slice(params.skip, params.skip + params.limit);
}
