import { faker } from '@faker-js/faker'
import type { Event } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

const eventCategories: Array<'conference' | 'meetup' | 'webinar' | 'concert' | 'sports' | 'festival'> = [
  'conference',
  'meetup',
  'webinar',
  'concert',
  'sports',
  'festival',
]

export function generateEvents(params: PaginationParams): Event[] {
  const items: Event[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip

  for (let i = 0; i < itemsToGenerate; i++) {
    const startDate = faker.date.future()
    const endDate = new Date(startDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000)
    const maxAttendees = faker.number.int({ min: 50, max: 10000 })

    const isFree = faker.datatype.boolean()
    items.push({
      id: faker.string.uuid(),
      title: faker.lorem.words(3),
      description: faker.lorem.paragraphs(2),
      category: eventCategories[faker.number.int({ min: 0, max: 5 })],
      location: faker.location.city(),
      address: faker.location.streetAddress(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      organizer: faker.person.fullName(),
      attendees: faker.number.int({ min: 0, max: maxAttendees }),
      maxAttendees,
      price: isFree ? 0 : parseFloat(faker.commerce.price({ min: 0, max: 500, dec: 2 })),
      isFree,
      image: faker.image.url(),
      tags: [faker.lorem.word(), faker.lorem.word()],
      createdAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        e.location.toLowerCase().includes(searchLower) ||
        e.organizer.toLowerCase().includes(searchLower)
    )
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
