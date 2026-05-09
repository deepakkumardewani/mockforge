import { faker } from '@faker-js/faker'
import type { Todo } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']

export function generateTodos(params: PaginationParams): Todo[] {
  const items: Todo[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip

  for (let i = 0; i < itemsToGenerate; i++) {
    items.push({
      id: faker.string.uuid(),
      userId: faker.string.uuid(),
      todo: faker.lorem.sentence(),
      completed: faker.datatype.boolean(),
      priority: priorities[faker.number.int({ min: 0, max: 2 })],
      dueDate: faker.date.future().toISOString(),
      createdAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter((t) => t.todo.toLowerCase().includes(searchLower))
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
