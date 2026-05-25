import type { Event } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/events.json";

const seed = seedData as Event[];

export function generateEvents(params: PaginationParams): Event[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
