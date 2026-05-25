import type { Country } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/countries.json";

const seed = seedData as Country[];

export function generateCountries(params: PaginationParams): Country[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q) ||
        c.currency.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
