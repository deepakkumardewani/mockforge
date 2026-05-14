import { faker } from "@faker-js/faker";
import type { User } from "@mockforge/types";
import type { PaginationParams } from "../../lib/pagination";

export function generateUsers(params: PaginationParams): User[] {
  const items: User[] = [];
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip;

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      username: faker.internet.username(),
      phone: faker.phone.number(),
      avatar: faker.image.avatar(),
      birthDate: faker.date.birthdate({ min: 18, max: 80, mode: "age" }).toISOString(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
        zipCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      createdAt: faker.date.recent().toISOString(),
    });
  }

  let filtered = items;
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = items.filter(
      (u) =>
        u.firstName.toLowerCase().includes(searchLower) ||
        u.lastName.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.username.toLowerCase().includes(searchLower),
    );
  }

  const start = params.skip;
  const end = start + params.limit;
  return filtered.slice(start, end);
}
