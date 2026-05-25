import type { Recipe } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/recipes.json";

const seed = seedData as Recipe[];

export function generateRecipes(params: PaginationParams): Recipe[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
