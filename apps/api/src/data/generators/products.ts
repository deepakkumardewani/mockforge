import { faker } from '@faker-js/faker'
import type { Product } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

export function generateProducts(params: PaginationParams): Product[] {
  const items: Product[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 })),
      discountPercentage: faker.number.int({ min: 0, max: 50 }),
      rating: parseFloat((Math.random() * 5).toFixed(1)),
      stock: faker.number.int({ min: 0, max: 200 }),
      brand: faker.company.name(),
      category: faker.commerce.department(),
      thumbnail: faker.image.url(),
      images: [faker.image.url(), faker.image.url(), faker.image.url()],
      sku: faker.string.alphanumeric(8).toUpperCase(),
      weight: parseFloat((Math.random() * 10).toFixed(2)),
      createdAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
    )
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
