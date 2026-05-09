import { faker } from '@faker-js/faker'
import type { Cart } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

export function generateCarts(params: PaginationParams): Cart[] {
  const items: Cart[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip

  for (let i = 0; i < itemsToGenerate; i++) {
    const totalProducts = faker.number.int({ min: 1, max: 10 })
    const products = Array.from({ length: totalProducts }, () => {
      const price = parseFloat(faker.commerce.price({ min: 5, max: 200, dec: 2 }))
      const quantity = faker.number.int({ min: 1, max: 5 })
      const discountPercentage = faker.number.int({ min: 0, max: 30 })
      const total = price * quantity
      const discountedTotal = total * (1 - discountPercentage / 100)

      return {
        productId: faker.string.uuid(),
        title: faker.commerce.productName(),
        price,
        quantity,
        total,
        discountPercentage,
        discountedTotal,
        thumbnail: faker.image.url(),
      }
    })

    const total = products.reduce((sum, p) => sum + p.total, 0)
    const discountedTotal = products.reduce((sum, p) => sum + p.discountedTotal, 0)
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0)

    items.push({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      products,
      total,
      discountedTotal,
      totalProducts,
      totalQuantity,
      createdAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter((c) =>
      c.products.some((p) => p.title.toLowerCase().includes(searchLower))
    )
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
