import { z } from "zod";

export const MAX_LIMIT = 100;
export const MAX_SKIP = 1000;
export const MAX_GENERATION_COUNT = MAX_LIMIT + MAX_SKIP;
export const CUSTOM_SEARCH_SAMPLE_SIZE = 200;

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(30),
  skip: z.coerce.number().int().min(0).max(MAX_SKIP).default(0),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

export function clampGraphQLListArgs(args: {
  limit?: number | null;
  skip?: number | null;
  search?: string | null;
}): PaginationParams {
  return {
    limit: Math.max(1, Math.min(MAX_LIMIT, args.limit ?? 10)),
    skip: Math.max(0, Math.min(MAX_SKIP, args.skip ?? 0)),
    search: args.search ?? undefined,
    order: "asc",
  };
}

function compareValues(left: unknown, right: unknown): number {
  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;
  if (typeof left === "number" && typeof right === "number") return left - right;
  return sortableString(left).localeCompare(sortableString(right), undefined, { numeric: true });
}

function sortableString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

/** Sort (when requested) then apply skip/limit. `order=desc` without `sort` reverses the list. */
export function pageRecords<T extends object>(items: readonly T[], params: PaginationParams): T[] {
  let next: T[] = items as T[];
  if (params.sort) {
    const key = params.sort;
    const dir = params.order === "desc" ? -1 : 1;
    next = [...items].sort((a, b) => {
      const rowA = a as Record<string, unknown>;
      const rowB = b as Record<string, unknown>;
      return compareValues(rowA[key], rowB[key]) * dir;
    });
  } else if (params.order === "desc") {
    next = [...items].reverse();
  }
  return next.slice(params.skip, params.skip + params.limit);
}
