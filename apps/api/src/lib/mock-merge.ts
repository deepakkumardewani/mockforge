import { pickDefined } from "./pick-defined";

export const MOCK_GENERATE_PARAMS = { limit: 1, skip: 0, order: "asc" as const };

type GenerateParams = {
  limit: number;
  skip: number;
  order: "asc" | "desc";
  search?: string;
  sort?: string;
};

function overlayMatchingBaseTypes(
  base: Record<string, unknown>,
  overlay: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...overlay };
  for (const key of Object.keys(next)) {
    const value = next[key];
    if (typeof value !== "string" || typeof base[key] !== "number") continue;
    const n = Number(value);
    if (Number.isInteger(n)) {
      next[key] = n;
    } else {
      delete next[key];
    }
  }
  return next;
}

/** One generated row shallow-merged with caller fields (REST POST/PUT parity). */
export function mergeGeneratedRow<T extends object>(
  generate: (params: GenerateParams) => T[],
  overlay: Record<string, unknown>,
): T {
  const base = generate(MOCK_GENERATE_PARAMS)[0]!;
  const overlayForRow = overlayMatchingBaseTypes(base as Record<string, unknown>, overlay);
  return { ...base, ...pickDefined(overlayForRow) };
}
