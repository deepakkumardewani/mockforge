import { faker } from '@faker-js/faker'
import type { Post } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

export function generatePosts(params: PaginationParams): Post[] {
  const items: Post[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      body: faker.lorem.paragraphs(3),
      userId: faker.string.uuid(),
      tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
      reactions: faker.number.int({ min: 0, max: 500 }),
      views: faker.number.int({ min: 0, max: 10000 }),
      createdAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter(
      (p) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.body.toLowerCase().includes(searchLower) ||
        p.tags.some((t) => t.toLowerCase().includes(searchLower))
    )
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
