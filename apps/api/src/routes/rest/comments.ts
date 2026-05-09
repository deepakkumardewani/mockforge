import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { paginationSchema } from '../../lib/pagination'
import { respond } from '../../lib/respond'
import { generateComments } from '../../data/generators/comments'

const router = new Hono()

router.get(
  '/',
  zValidator('query', paginationSchema),
  (c) => {
    const params = c.req.valid('query')
    const data = generateComments(params)
    const total = data.length
    return c.json(respond(data, total, params, 'comments'))
  }
)

router.get(
  '/search',
  zValidator('query', z.object({ q: z.string().default('') })),
  (c) => {
    const { q } = c.req.valid('query')
    const params = paginationSchema.parse({ search: q })
    const data = generateComments(params)
    const total = data.length
    return c.json(respond(data, total, params, 'comments'))
  }
)

router.get('/:id', (c) => {
  const item = generateComments({ limit: 1, skip: 0, order: 'asc' })[0]
  return c.json({ data: item })
})

router.post('/', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const item = generateComments({ limit: 1, skip: 0, order: 'asc' })[0]
  return c.json({ data: { ...item, ...body } }, 201)
})

router.put('/:id', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const item = generateComments({ limit: 1, skip: 0, order: 'asc' })[0]
  return c.json({ data: { ...item, ...body } })
})

router.delete('/:id', (c) => {
  const id = c.req.param('id')
  return c.json({ deleted: true, id }, 200)
})

export default router
