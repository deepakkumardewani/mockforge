import { nanoid } from "nanoid";
import type { Dispatch, SetStateAction } from "react";

export type EventKind = "system" | "in" | "out" | "error";

export type BoundedEvent = {
  readonly id: string;
  readonly direction: "in" | "out";
  readonly kind?: EventKind;
  readonly message: string;
  readonly at: number;
};

/** Max EventLog rows rendered at once. Stored console history may be larger. */
export const EVENT_LOG_RENDER_CAP = 120;

const LIFECYCLE_TAG = /^\[([^\]]+)\]/;

export function inferEventKind(direction: BoundedEvent["direction"], message: string): EventKind {
  const tag = LIFECYCLE_TAG.exec(message)?.[1]?.toLowerCase();
  if (tag === "error" || tag === "connect_error") return "error";
  if (tag === "connected" || tag === "disconnected") return "system";
  return direction;
}

export function resolveEventKind(
  event: Pick<BoundedEvent, "direction" | "message" | "kind">,
): EventKind {
  return event.kind ?? inferEventKind(event.direction, event.message);
}

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
  kind?: EventKind,
) {
  setEvents((prev) =>
    pushBounded(
      prev,
      {
        id: nanoid(),
        direction,
        kind: kind ?? inferEventKind(direction, message),
        message,
        at: Date.now(),
      },
      cap,
    ),
  );
}
