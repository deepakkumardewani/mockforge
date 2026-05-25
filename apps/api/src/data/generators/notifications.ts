import type { Notification } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";
import seedData from "../seed/notifications.json";

const seed = seedData as Notification[];

export function generateNotifications(params: PaginationParams): Notification[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter(
      (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q),
    );
  }

  return items.slice(params.skip, params.skip + params.limit);
}
