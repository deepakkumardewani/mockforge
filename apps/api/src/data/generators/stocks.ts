import { faker } from '@faker-js/faker'
import type { Stock } from '@mockforge/types'
import type { PaginationParams } from '../../lib/pagination'

const STOCK_SYMBOLS = ['AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NVDA', 'AMD', 'NFLX', 'SHOP', 'JPM', 'V', 'MA', 'DIS', 'BA']
const STOCK_NAMES: Record<string, string> = {
  AAPL: 'Apple Inc.',
  TSLA: 'Tesla Inc.',
  MSFT: 'Microsoft Corporation',
  AMZN: 'Amazon.com Inc.',
  GOOGL: 'Alphabet Inc.',
  META: 'Meta Platforms Inc.',
  NVDA: 'NVIDIA Corporation',
  AMD: 'Advanced Micro Devices',
  NFLX: 'Netflix Inc.',
  SHOP: 'Shopify Inc.',
  JPM: 'JPMorgan Chase',
  V: 'Visa Inc.',
  MA: 'Mastercard Inc.',
  DIS: 'The Walt Disney Company',
  BA: 'The Boeing Company',
}

export function generateStocks(params: PaginationParams): Stock[] {
  const items: Stock[] = []
  const itemsToGenerate = params.search ? 200 : params.limit + params.skip
  const usedSymbols = new Set<string>()

  for (let i = 0; i < itemsToGenerate; i++) {
    let symbol = STOCK_SYMBOLS[i % STOCK_SYMBOLS.length]
    if (usedSymbols.has(symbol) && i < STOCK_SYMBOLS.length) {
      symbol = STOCK_SYMBOLS[faker.number.int({ min: 0, max: STOCK_SYMBOLS.length - 1 })]
    }
    usedSymbols.add(symbol)

    const price = parseFloat((Math.random() * 500 + 50).toFixed(2))
    const changePercent = parseFloat((Math.random() * 10 - 5).toFixed(2))
    const change = parseFloat((price * (changePercent / 100)).toFixed(2))

    items.push({
      id: faker.string.uuid(),
      symbol,
      name: STOCK_NAMES[symbol] || faker.company.name(),
      price,
      change,
      changePercent,
      open: price * (1 + Math.random() * 0.1 - 0.05),
      high: price * (1 + Math.random() * 0.15),
      low: price * (1 - Math.random() * 0.15),
      volume: faker.number.int({ min: 1000000, max: 100000000 }),
      marketCap: faker.number.int({ min: 100000000, max: 3000000000000 }),
      exchange: faker.helpers.arrayElement(['NYSE', 'NASDAQ']),
      updatedAt: faker.date.recent().toISOString(),
    })
  }

  let filtered = items
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = items.filter(
      (s) =>
        s.symbol.toLowerCase().includes(searchLower) ||
        s.name.toLowerCase().includes(searchLower)
    )
  }

  const start = params.skip
  const end = start + params.limit
  return filtered.slice(start, end)
}
