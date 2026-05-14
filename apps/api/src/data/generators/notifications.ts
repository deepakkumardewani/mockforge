import { faker } from "@faker-js/faker";
import type { Notification } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";

const notificationTypes: Array<"info" | "warning" | "success" | "error"> = [
  "info",
  "warning",
  "success",
  "error",
];

export function generateNotifications(params: PaginationParams): Notification[] {
  const items: Notification[] = [];
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip;

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      type: notificationTypes[faker.number.int({ min: 0, max: 3 })],
      title: faker.lorem.sentence(),
      message: faker.lorem.paragraphs(1),
      read: faker.datatype.boolean(),
      createdAt: faker.date.recent().toISOString(),
    });
  }

  let filtered = items;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = items.filter(
      (n) =>
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower),
    );
  }

  const start = params.skip;
  const end = start + params.limit;
  return filtered.slice(start, end);
}
