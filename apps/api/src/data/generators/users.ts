import type { User } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/users.json";

const seed = seedData as User[];

export function generateUsers(params: PaginationParams): User[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
