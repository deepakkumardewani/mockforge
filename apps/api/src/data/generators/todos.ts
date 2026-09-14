import type { Todo } from "@mockforge/types";
import { pageRecords, type PaginationParams } from "../../lib/pagination";
import seedData from "../seed/todos.json";

const seed = seedData as Todo[];

export function generateTodos(params: PaginationParams): Todo[] {
  let items = seed;

  if (params.search) {
    const q = params.search.toLowerCase();
    items = seed.filter((t) => t.todo.toLowerCase().includes(q));
  }

  return pageRecords(items, params);
}
