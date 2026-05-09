import { faker } from '@faker-js/faker'
import type { Company } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

export function generateCompanies(params: PaginationParams): Company[] {
  const items: Company[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      name: faker.company.name(),
      industry: faker.lorem.word(),
      description: faker.lorem.paragraphs(1),
      website: faker.internet.url(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      foundedYear: faker.number.int({ min: 1950, max: 2024 }),
      employees: faker.number.int({ min: 10, max: 50000 }),
      revenue: `$${faker.number.int({ min: 100000, max: 10000000000 }).toLocaleString()}`,
      logo: faker.image.url(),
      createdAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.industry.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
    )
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
