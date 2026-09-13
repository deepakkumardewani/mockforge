import type { Stock } from "@mockforge/types";
import { generateStocks } from "../data/generators/stocks";
import { DEFAULT_WS_PARAMS } from "./types";

const DEFAULT_SYMBOL_COUNT = 10;

export const TICKER_EVENT = "tick" as const;

export interface TickerBook {
  readonly symbols: readonly Stock[];
  readonly prices: Record<string, number>;
  cursor: number;
}

export function createTickerBook(count = DEFAULT_SYMBOL_COUNT): TickerBook {
  const symbols = generateStocks({ ...DEFAULT_WS_PARAMS, limit: count });
  return {
    symbols,
    prices: Object.fromEntries(symbols.map((stock) => [stock.symbol, stock.price])),
    cursor: 0,
  };
}

function roundCurrency(value: number): number {
  return Number(value.toFixed(2));
}

export function nextStockTick(book: TickerBook): Stock {
  if (book.symbols.length === 0) {
    throw new Error("ticker book has no symbols");
  }

  const stock = book.symbols[book.cursor % book.symbols.length]!;
  book.cursor += 1;

  const previousPrice = book.prices[stock.symbol] ?? stock.price;
  const fluctuationPercent = (Math.random() * 2.5 - 0.5) / 100;
  const price = roundCurrency(previousPrice * (1 + fluctuationPercent));
  book.prices[stock.symbol] = price;

  const change = roundCurrency(price - stock.open);
  const changePercent = roundCurrency((change / stock.open) * 100);
  return { ...stock, price, change, changePercent };
}
