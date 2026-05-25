import type { Stock } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/stocks.json";

const seed = seedData as Stock[];

export function generateStocks(params: PaginationParams): Stock[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
