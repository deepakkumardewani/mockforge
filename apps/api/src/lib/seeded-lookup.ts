import type { PaginationParams } from "./pagination";

type SeededGenerator<T> = (params: PaginationParams) => T[];

const FIRST_ROW = { limit: 1, skip: 0, order: "asc" as const };

/** Strict lookup: invalid or out-of-range id is not found. */
export function findSeededById<T>(generate: SeededGenerator<T>, rawId: string): T | null {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }

  return generate({ limit: 1, skip: id - 1, order: "asc" })[0] ?? null;
}

/** REST GET /:id — non-numeric/non-positive ids fall back to the first seeded row. */
export function findSeededByIdRest<T>(generate: SeededGenerator<T>, rawId: string): T | null {
  const id = Number(rawId);
  const skip = Number.isFinite(id) && id > 0 ? id - 1 : 0;
  return generate({ ...FIRST_ROW, skip })[0] ?? null;
}
