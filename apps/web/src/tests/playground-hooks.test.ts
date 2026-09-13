import { createElement, createRef, useRef, type Dispatch, type SetStateAction } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, renderHook } from "@testing-library/react";
import {
  appendEvent,
  inferEventKind,
  pushBounded,
  resolveEventKind,
  type BoundedEvent,
} from "@/components/playground/hooks/bounded-events";
import { timedFetch } from "@/components/playground/hooks/timed-fetch";
import { useSendShortcut } from "@/components/playground/hooks/use-send-shortcut";

describe("inferEventKind", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps error lifecycle tags to error", () => {
    expect(inferEventKind("in", "[error] socket failed")).toBe("error");
    expect(inferEventKind("out", "[connect_error] refused")).toBe("error");
  });

  it("maps connected and disconnected tags to system", () => {
    expect(inferEventKind("in", "[connected]")).toBe("system");
    expect(inferEventKind("in", "[disconnected] bye")).toBe("system");
  });

  it("falls back to the event direction when no lifecycle tag matches", () => {
    expect(inferEventKind("in", "hello")).toBe("in");
    expect(inferEventKind("out", "[unknown] payload")).toBe("out");
  });
});

describe("resolveEventKind", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prefers an explicit kind over inference", () => {
    expect(resolveEventKind({ direction: "in", message: "[error] x", kind: "out" })).toBe("out");
  });

  it("infers kind when none is stored", () => {
    expect(resolveEventKind({ direction: "in", message: "[connected]" })).toBe("system");
  });
});

describe("pushBounded", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("appends when under the cap", () => {
    expect(pushBounded([1, 2], 3, 5)).toEqual([1, 2, 3]);
  });

  it("drops the oldest items when over the cap", () => {
    expect(pushBounded([1, 2, 3], 4, 3)).toEqual([2, 3, 4]);
  });
});

describe("appendEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("appends an inferred event through the React setter", () => {
    let next: BoundedEvent[] = [];
    const setEvents: Dispatch<SetStateAction<BoundedEvent[]>> = (updater) => {
      next = typeof updater === "function" ? updater([]) : updater;
    };

    appendEvent(setEvents, "in", "[connected]", 10);
    expect(next).toHaveLength(1);
    expect(next[0]?.direction).toBe("in");
    expect(next[0]?.kind).toBe("system");
    expect(next[0]?.message).toBe("[connected]");
    expect(next[0]?.at).toBe(1_700_000_000_000);
    expect(next[0]?.id.length).toBeGreaterThan(0);
  });

  it("honors an explicit kind and respects the cap", () => {
    const existing: BoundedEvent[] = [
      { id: "a", direction: "in", message: "old", at: 1 },
      { id: "b", direction: "out", message: "mid", at: 2 },
    ];
    let state = existing;
    const setEvents: Dispatch<SetStateAction<BoundedEvent[]>> = (updater) => {
      state = typeof updater === "function" ? updater(state) : updater;
    };

    appendEvent(setEvents, "out", "newest", 2, "error");

    expect(state).toHaveLength(2);
    expect(state[0]?.id).toBe("b");
    expect(state[1]?.message).toBe("newest");
    expect(state[1]?.kind).toBe("error");
  });
});

describe("timedFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses JSON bodies and flattens response headers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 201,
        statusText: "Created",
        headers: new Headers({ "X-Request-Id": "req-1" }),
        text: () => Promise.resolve('{"id":9}'),
      } as Response),
    );

    const result = await timedFetch("/api/items", { method: "POST" });

    expect(result.status).toBe(201);
    expect(result.statusText).toBe("Created");
    expect(result.body).toEqual({ id: 9 });
    expect(result.headers["x-request-id"]).toBe("req-1");
    expect(typeof result.timeMs).toBe("number");
  });

  it("returns null for an empty body and raw text for invalid JSON", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 204,
        statusText: "No Content",
        headers: new Headers(),
        text: () => Promise.resolve(""),
      } as Response)
      .mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("   "),
      } as Response)
      .mockResolvedValueOnce({
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        text: () => Promise.resolve("not-json"),
      } as Response);
    vi.stubGlobal("fetch", fetchMock);

    expect((await timedFetch("/empty", {})).body).toBeNull();
    expect((await timedFetch("/spaces", {})).body).toBe("   ");
    expect((await timedFetch("/text", {})).body).toBe("not-json");
  });
});

function ShortcutHost({
  onSend,
  enabled,
  withRef,
}: {
  onSend: () => void;
  enabled?: boolean;
  withRef?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useSendShortcut(onSend, enabled, withRef ? ref : undefined);
  return createElement("div", { ref, role: "region", "aria-label": "playground panel" });
}

describe("useSendShortcut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fires onSend for Cmd+Enter on window when no ref is supplied", () => {
    const onSend = vi.fn();
    render(createElement(ShortcutHost, { onSend }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("fires onSend for Ctrl+Enter", () => {
    const onSend = vi.fn();
    render(createElement(ShortcutHost, { onSend }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("ignores Enter without a modifier", () => {
    const onSend = vi.fn();
    render(createElement(ShortcutHost, { onSend }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not bind a listener when disabled", () => {
    const onSend = vi.fn();
    render(createElement(ShortcutHost, { onSend, enabled: false }));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("listens on the container ref instead of window", () => {
    const onSend = vi.fn();
    const { getByRole } = render(createElement(ShortcutHost, { onSend, withRef: true }));
    const panel = getByRole("region", { name: "playground panel" });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true }));
    expect(onSend).not.toHaveBeenCalled();

    panel.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", metaKey: true, bubbles: true }),
    );
    expect(onSend).toHaveBeenCalledTimes(1);
  });

  it("removes the window listener on unmount", () => {
    const onSend = vi.fn();
    const { unmount } = render(createElement(ShortcutHost, { onSend }));

    unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does nothing when a supplied ref is still empty", () => {
    const onSend = vi.fn();
    const emptyRef = createRef<HTMLElement | null>();

    function EmptyRefHost() {
      useSendShortcut(onSend, true, emptyRef);
      return createElement("div");
    }

    render(createElement(EmptyRefHost));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", metaKey: true }));
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});

describe("useSendShortcut hook wrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prevents the default action on a matching shortcut", () => {
    const onSend = vi.fn();
    renderHook(() => useSendShortcut(onSend, true));

    const event = new KeyboardEvent("keydown", { key: "Enter", metaKey: true, cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});
