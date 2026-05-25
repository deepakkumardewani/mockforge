import type { Message } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/messages.json";

const seed = seedData as Message[];

export function generateMessages(params: PaginationParams): Message[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter((m) => m.body.toLowerCase().includes(q));
  }

  return items.slice(params.skip, params.skip + params.limit);
}
