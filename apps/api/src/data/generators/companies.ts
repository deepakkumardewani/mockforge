import type { Company } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/companies.json";

const seed = seedData as Company[];

export function generateCompanies(params: PaginationParams): Company[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
