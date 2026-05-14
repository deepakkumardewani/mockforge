import type { ApiResponse } from "@mockforge/types";
import type { PaginationParams } from "./pagination";

export function respond<T>(
  data: T[],
  total: number,
  params: PaginationParams,
  entity: string,
): ApiResponse<T> {
  return {
    data,
    total,
    limit: params.limit,
    skip: params.skip,
    meta: {
      entity,
      generatedAt: new Date().toISOString(),
    },
  };
}
