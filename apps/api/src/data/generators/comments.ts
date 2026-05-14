import { faker } from "@faker-js/faker";
import type { Comment } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";

export function generateComments(params: PaginationParams): Comment[] {
  const items: Comment[] = [];
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip;

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      postId: faker.string.uuid(),
      userId: faker.string.uuid(),
      body: faker.lorem.paragraphs(1),
      author: faker.person.fullName(),
      email: faker.internet.email(),
      createdAt: faker.date.recent().toISOString(),
    });
  }

  let filtered = items;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = items.filter(
      (c) =>
        c.body.toLowerCase().includes(searchLower) ||
        c.author.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower),
    );
  }

  const start = params.skip;
  const end = start + params.limit;
  return filtered.slice(start, end);
}
