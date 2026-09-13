import { nanoid } from "nanoid";
import type { Dispatch, SetStateAction } from "react";

export type BoundedEvent = {
  readonly id: string;
  readonly direction: "in" | "out";
  readonly message: string;
  readonly at: number;
};

export function pushBounded<T>(prev: T[], next: T, cap: number): T[] {
  const merged = [...prev, next];
  if (merged.length <= cap) return merged;
  return merged.slice(merged.length - cap);
}

export function appendEvent(
  setEvents: Dispatch<SetStateAction<BoundedEvent[]>>,
  direction: BoundedEvent["direction"],
  message: string,
  cap: number,
) {
  setEvents((prev) => pushBounded(prev, { id: nanoid(), direction, message, at: Date.now() }, cap));
}
