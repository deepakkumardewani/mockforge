/** Strip null/undefined so GraphQL optional args behave like REST JSON merges. */
export function pickDefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key of Object.keys(input) as (keyof T)[]) {
    const value = input[key];
    if (value !== null && value !== undefined) {
      result[key] = value as T[keyof T];
    }
  }
  return result;
}
