import { faker } from "@faker-js/faker";
import type { Country } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";

export function generateCountries(params: PaginationParams): Country[] {
  const items: Country[] = [];
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip;

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      name: faker.location.country(),
      code: faker.location.countryCode("alpha-2"),
      capital: faker.location.city(),
      region: faker.lorem.word(),
      subregion: faker.lorem.word(),
      population: faker.number.int({ min: 100000, max: 1000000000 }),
      area: faker.number.int({ min: 1000, max: 10000000 }),
      currency: faker.finance.currencyCode(),
      language: faker.lorem.word(),
      flag: faker.helpers.arrayElement(["🇺🇸", "🇬🇧", "🇨🇦", "🇫🇷", "🇩🇪", "🇮🇳", "🇯🇵", "🇦🇺"]),
      createdAt: faker.date.recent().toISOString(),
    });
  }

  let filtered = items;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = items.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.code.toLowerCase().includes(searchLower) ||
        c.capital.toLowerCase().includes(searchLower) ||
        c.currency.toLowerCase().includes(searchLower),
    );
  }

  const start = params.skip;
  const end = start + params.limit;
  return filtered.slice(start, end);
}
