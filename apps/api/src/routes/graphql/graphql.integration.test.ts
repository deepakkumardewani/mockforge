import { describe, it, expect } from 'vitest'
import { createYoga } from 'graphql-yoga'
import builder from './builder'

// Import type definitions to register them with builder
import './types/tier1'
import './types/tier2'

// Import queries to register them with builder
import './queries/tier1'
import './queries/tier2'

// Build the schema
const schema = builder.toSchema()

// Create the yoga instance with the schema
const yoga = createYoga({
  schema,
  graphiql: false,
})

describe('GraphQL Integration Tests', () => {
  describe('Tier 1 Queries', () => {
    it('should fetch products with limit parameter', async () => {
      const query = `
        query {
          products(limit: 3) {
            id
            title
            price
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data).toBeDefined()
      expect(data.data.products).toBeDefined()
      expect(Array.isArray(data.data.products)).toBe(true)
      expect(data.data.products.length).toBeLessThanOrEqual(3)
      expect(data.data.products.length).toBeGreaterThan(0)

      if (data.data.products.length > 0) {
        expect(data.data.products[0]).toHaveProperty('id')
        expect(data.data.products[0]).toHaveProperty('title')
        expect(data.data.products[0]).toHaveProperty('price')
        expect(typeof data.data.products[0].price).toBe('number')
      }
    })

    it('should fetch users with search parameter', async () => {
      const query = `
        query {
          users(limit: 5, search: "john") {
            id
            firstName
            lastName
            email
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data).toBeDefined()
      expect(data.data.users).toBeDefined()
      expect(Array.isArray(data.data.users)).toBe(true)
    })

    it('should fetch a single user', async () => {
      const query = `
        query {
          user(id: "1") {
            id
            firstName
            email
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data).toBeDefined()
      expect(data.data.user).toBeDefined()
      expect(data.data.user).toHaveProperty('id')
      expect(data.data.user).toHaveProperty('firstName')
      expect(data.data.user).toHaveProperty('email')
    })

    it('should fetch posts', async () => {
      const query = `
        query {
          posts(limit: 5) {
            id
            title
            body
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.posts).toBeDefined()
      expect(Array.isArray(data.data.posts)).toBe(true)
    })

    it('should fetch comments', async () => {
      const query = `
        query {
          comments(limit: 3) {
            id
            body
            author
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.comments).toBeDefined()
      expect(Array.isArray(data.data.comments)).toBe(true)
    })

    it('should fetch todos', async () => {
      const query = `
        query {
          todos(limit: 4) {
            id
            todo
            completed
            priority
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.todos).toBeDefined()
      expect(Array.isArray(data.data.todos)).toBe(true)
    })

    it('should fetch carts', async () => {
      const query = `
        query {
          carts(limit: 2) {
            id
            userId
            total
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.carts).toBeDefined()
      expect(Array.isArray(data.data.carts)).toBe(true)
    })
  })

  describe('Tier 2 Queries', () => {
    it('should fetch stocks with limit parameter', async () => {
      const query = `
        query {
          stocks(limit: 5) {
            id
            symbol
            price
            change
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data).toBeDefined()
      expect(data.data.stocks).toBeDefined()
      expect(Array.isArray(data.data.stocks)).toBe(true)
      expect(data.data.stocks.length).toBeLessThanOrEqual(5)

      if (data.data.stocks.length > 0) {
        expect(data.data.stocks[0]).toHaveProperty('symbol')
        expect(data.data.stocks[0]).toHaveProperty('price')
        expect(typeof data.data.stocks[0].price).toBe('number')
      }
    })

    it('should fetch recipes', async () => {
      const query = `
        query {
          recipes(limit: 2) {
            id
            name
            cuisine
            difficulty
            ingredients {
              name
              quantity
              unit
            }
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.recipes).toBeDefined()
      expect(Array.isArray(data.data.recipes)).toBe(true)
      expect(data.data.recipes.length).toBeLessThanOrEqual(2)

      if (data.data.recipes.length > 0) {
        expect(data.data.recipes[0]).toHaveProperty('name')
        expect(data.data.recipes[0]).toHaveProperty('ingredients')
        expect(Array.isArray(data.data.recipes[0].ingredients)).toBe(true)
      }
    })

    it('should fetch a single stock', async () => {
      const query = `
        query {
          stock(id: "1") {
            id
            symbol
            price
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.stock).toBeDefined()
      expect(data.data.stock).toHaveProperty('symbol')
      expect(data.data.stock).toHaveProperty('price')
    })

    it('should fetch messages', async () => {
      const query = `
        query {
          messages(limit: 3) {
            id
            senderId
            body
            read
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.messages).toBeDefined()
      expect(Array.isArray(data.data.messages)).toBe(true)
    })

    it('should fetch notifications', async () => {
      const query = `
        query {
          notifications(limit: 3) {
            id
            userId
            type
            title
            read
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.notifications).toBeDefined()
      expect(Array.isArray(data.data.notifications)).toBe(true)
    })

    it('should fetch quotes', async () => {
      const query = `
        query {
          quotes(limit: 4) {
            id
            content
            author
            category
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.quotes).toBeDefined()
      expect(Array.isArray(data.data.quotes)).toBe(true)
    })

    it('should fetch countries', async () => {
      const query = `
        query {
          countries(limit: 3) {
            id
            name
            code
            capital
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.countries).toBeDefined()
      expect(Array.isArray(data.data.countries)).toBe(true)
    })

    it('should fetch companies', async () => {
      const query = `
        query {
          companies(limit: 2) {
            id
            name
            industry
            website
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.companies).toBeDefined()
      expect(Array.isArray(data.data.companies)).toBe(true)
    })

    it('should fetch events', async () => {
      const query = `
        query {
          events(limit: 3) {
            id
            title
            location
            isFree
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.events).toBeDefined()
      expect(Array.isArray(data.data.events)).toBe(true)
    })
  })

  describe('Pagination and Search', () => {
    it('should respect skip parameter', async () => {
      const query = `
        query {
          products(limit: 5, skip: 10) {
            id
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.products).toBeDefined()
      expect(Array.isArray(data.data.products)).toBe(true)
    })

    it('should handle multiple fields in a query', async () => {
      const query = `
        query {
          users(limit: 2) {
            id
            firstName
            lastName
            email
            address {
              city
              country
            }
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(response.status).toBe(200)
      expect(data.data.users).toBeDefined()

      if (data.data.users.length > 0) {
        expect(data.data.users[0]).toHaveProperty('address')
        expect(data.data.users[0].address).toHaveProperty('city')
        expect(data.data.users[0].address).toHaveProperty('country')
      }
    })
  })

  describe('Error Handling', () => {
    it('should return error for invalid query', async () => {
      const query = `
        query {
          invalidField {
            id
          }
        }
      `

      const request = new Request('http://localhost/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })

      const response = await yoga.fetch(request)
      const data = await response.json() as any

      expect(data.errors).toBeDefined()
      expect(Array.isArray(data.errors)).toBe(true)
    })
  })
})
