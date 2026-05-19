import { pickDefined } from "./pick-defined";

export const MOCK_GENERATE_PARAMS = { limit: 1, skip: 0, order: "asc" as const };

type GenerateParams = {
  limit: number;
  skip: number;
  order: "asc" | "desc";
  search?: string;
  sort?: string;
};

/** One generated row shallow-merged with caller fields (REST POST/PUT parity). */
export function mergeGeneratedRow<T extends object>(
  generate: (params: GenerateParams) => T[],
  overlay: Record<string, unknown>,
): T {
  const base = generate(MOCK_GENERATE_PARAMS)[0]!;
  return { ...base, ...pickDefined(overlay) };
}
