import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createTickerBook, nextStockTick, TICKER_EVENT } from "./ticker-book";

describe("createTickerBook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("seeds ten symbols by default with matching prices and cursor 0", () => {
    const book = createTickerBook();

    expect(book.symbols).toHaveLength(10);
    expect(book.cursor).toBe(0);
    expect(Object.keys(book.prices)).toHaveLength(10);

    for (const stock of book.symbols) {
      expect(book.prices[stock.symbol]).toBe(stock.price);
    }
  });

  it("seeds the requested number of symbols", () => {
    const book = createTickerBook(3);

    expect(book.symbols).toHaveLength(3);
    expect(book.cursor).toBe(0);
    expect(Object.keys(book.prices)).toHaveLength(3);
  });
});

describe("nextStockTick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when the book has no symbols", () => {
    const book = createTickerBook(0);

    expect(() => nextStockTick(book)).toThrow("ticker book has no symbols");
  });

  it("leaves price unchanged when the random fluctuation is zero", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.2);
    const book = createTickerBook(1);
    const original = book.symbols[0]!;
    const previousPrice = original.price;

    const tick = nextStockTick(book);

    expect(tick.symbol).toBe(original.symbol);
    expect(tick.price).toBe(previousPrice);
    expect(book.prices[original.symbol]).toBe(previousPrice);
    expect(tick.change).toBe(Number((previousPrice - original.open).toFixed(2)));
    expect(tick.changePercent).toBe(
      Number((((previousPrice - original.open) / original.open) * 100).toFixed(2)),
    );
    expect(book.cursor).toBe(1);
  });

  it("applies a deterministic 0.5 percent move when Math.random is 0.4", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.4);
    const book = createTickerBook(1);
    const original = book.symbols[0]!;
    const expectedPrice = Number((original.price * 1.005).toFixed(2));
    const expectedChange = Number((expectedPrice - original.open).toFixed(2));
    const expectedChangePercent = Number(((expectedChange / original.open) * 100).toFixed(2));

    const tick = nextStockTick(book);

    expect(tick.price).toBe(expectedPrice);
    expect(tick.change).toBe(expectedChange);
    expect(tick.changePercent).toBe(expectedChangePercent);
    expect(book.prices[original.symbol]).toBe(expectedPrice);
  });

  it("advances the cursor and wraps around the symbol list", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.2);
    const book = createTickerBook(2);
    const first = book.symbols[0]!;
    const second = book.symbols[1]!;

    const firstTick = nextStockTick(book);
    const secondTick = nextStockTick(book);
    const thirdTick = nextStockTick(book);

    expect(firstTick.symbol).toBe(first.symbol);
    expect(secondTick.symbol).toBe(second.symbol);
    expect(thirdTick.symbol).toBe(first.symbol);
    expect(book.cursor).toBe(3);
  });

  it("exports the tick event name", () => {
    expect(TICKER_EVENT).toBe("tick");
  });
});
