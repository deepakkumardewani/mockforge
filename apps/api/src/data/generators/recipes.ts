import { faker } from "@faker-js/faker";
import type { Recipe, RecipeIngredient } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";

const difficulties: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];

export function generateRecipes(params: PaginationParams): Recipe[] {
  const items: Recipe[] = [];
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip;

  for (let i = 0; i < itemsToGenerate; i++) {
    const ingredients: RecipeIngredient[] = Array.from(
      { length: faker.number.int({ min: 3, max: 10 }) },
      () => ({
        name: faker.lorem.word(),
        quantity: faker.number.int({ min: 1, max: 5 }).toString(),
        unit: faker.helpers.arrayElement(["cup", "tbsp", "tsp", "g", "ml", "oz"]),
      }),
    );

    const instructions = Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () =>
      faker.lorem.sentence(),
    );

    items.push({
      id: faker.string.uuid(),
      name: faker.lorem.words(2),
      description: faker.lorem.paragraphs(1),
      prepTimeMinutes: faker.number.int({ min: 5, max: 60 }),
      cookTimeMinutes: faker.number.int({ min: 10, max: 120 }),
      servings: faker.number.int({ min: 1, max: 8 }),
      difficulty: difficulties[faker.number.int({ min: 0, max: 2 })],
      cuisine: faker.lorem.word(),
      calories: faker.number.int({ min: 100, max: 1000 }),
      tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
      ingredients,
      instructions,
      image: faker.image.url(),
      rating: parseFloat((Math.random() * 5).toFixed(1)),
      createdAt: faker.date.recent().toISOString(),
    });
  }

  let filtered = items;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = items.filter(
      (r) =>
        r.name.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.cuisine.toLowerCase().includes(searchLower) ||
        r.tags.some((t) => t.toLowerCase().includes(searchLower)),
    );
  }

  const start = params.skip;
  const end = start + params.limit;
  return filtered.slice(start, end);
}
