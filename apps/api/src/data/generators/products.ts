import type { Product } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/products.json";

const seed = seedData as Product[];

export function generateProducts(params: PaginationParams): Product[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
