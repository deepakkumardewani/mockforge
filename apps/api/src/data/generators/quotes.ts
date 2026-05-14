import { faker } from "@faker-js/faker";
import type { Quote } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";

export function generateQuotes(params: PaginationParams): Quote[] {
  const items: Quote[] = [];
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip;

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      content: faker.lorem.sentences(2),
      author: faker.person.fullName(),
      category: faker.lorem.word(),
      likes: faker.number.int({ min: 0, max: 1000 }),
      createdAt: faker.date.recent().toISOString(),
    });
  }

  let filtered = items;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = items.filter(
      (q) =>
        q.content.toLowerCase().includes(searchLower) ||
        q.author.toLowerCase().includes(searchLower) ||
        q.category.toLowerCase().includes(searchLower),
    );
  }

  const start = params.skip;
  const end = start + params.limit;
  return filtered.slice(start, end);
}
