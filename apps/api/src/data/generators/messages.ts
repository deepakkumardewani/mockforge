import { faker } from '@faker-js/faker'
import type { Message } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

export function generateMessages(params: PaginationParams): Message[] {
  const items: Message[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      senderId: faker.string.uuid(),
      receiverId: faker.string.uuid(),
      roomId: faker.string.uuid(),
      body: faker.lorem.paragraphs(1),
      read: faker.datatype.boolean(),
      createdAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter((m) => m.body.toLowerCase().includes(searchLower))
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
